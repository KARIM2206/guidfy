"""
Feature Engineering
====================
Computes feature vectors for (User, Job) pairs used by the ranking model.

Features:
  F1  skill_overlap_score      – Jaccard overlap between user skills and job skills
  F2  skill_coverage_score     – % of required job skills user has (weighted by confidence)
  F3  skill_gap_score          – normalized count of missing critical skills
  F4  lp_alignment_score       – how well LP track aligns with job domain
  F5  experience_level_match   – +1 match / 0 neutral / -1 over or under-qualified
  F6  semantic_similarity      – SBERT cosine sim between user profile and job text
  F7  skill_depth_score        – average proficiency on matched skills
  F8  location_match           – 1.0 remote / 0.8 same city / 0.5 country / 0.0 none
  F9  freshness_score          – how recently job was posted (exponential decay)
  F10 title_similarity         – SBERT sim between LP title and job title
"""

import math
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Optional
import logging

from .skill_extractor import (
    ExtractedSkill, SkillExtractor, UserSkillProfile, SKILL_TAXONOMY
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Data Models (mirrors Prisma schema)
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class JobRecord:
    """Mirrors the Job model from Prisma (post-scraping)."""
    id: int
    title: str
    description: str
    company: str
    location: Optional[str]
    job_type: str
    experience_level: Optional[str]
    learning_path_id: int
    learning_path_title: str
    posted_at: Optional[datetime]
    source: str
    apply_link: Optional[str]

    # Computed after extraction (cached in DB as JSON)
    extracted_skills: list[str] = field(default_factory=list)
    skill_embedding: Optional[list[float]] = None


@dataclass
class FeatureVector:
    """All features for one (user, job) pair."""
    # Core matching
    skill_overlap_score: float = 0.0
    skill_coverage_score: float = 0.0
    skill_gap_score: float = 0.0
    skill_depth_score: float = 0.0

    # Learning path
    lp_alignment_score: float = 0.0

    # Experience
    experience_level_match: float = 0.0

    # Semantic
    semantic_similarity: float = 0.0
    title_similarity: float = 0.0

    # Context
    location_match: float = 0.5
    freshness_score: float = 1.0

    def to_list(self) -> list[float]:
        return list(asdict(self).values())

    @classmethod
    def feature_names(cls) -> list[str]:
        return list(cls.__dataclass_fields__.keys())


@dataclass
class RecommendationResult:
    """Output returned to client / API."""
    job_id: int
    title: str
    company: str
    location: Optional[str]
    job_type: str
    apply_link: Optional[str]
    learning_path_id: int

    score: float            # 0.0 – 1.0 final ranking score
    features: FeatureVector

    explanation: list[str]          # human-readable reasons
    matched_skills: list[str]       # skills user has that job wants
    missing_skills: list[str]       # skill gaps
    skill_gap_pct: float            # % of job skills user is missing


# ─────────────────────────────────────────────────────────────────────────────
# Feature Computer
# ─────────────────────────────────────────────────────────────────────────────

# Domain → skills mapping (for LP alignment)
DOMAIN_SKILL_MAP: dict[str, set[str]] = {
    "frontend":    {"react", "nextjs", "angular", "vue", "typescript", "javascript",
                    "html", "css", "redux", "webpack"},
    "backend":     {"nodejs", "python", "django", "fastapi", "java", "dotnet",
                    "postgresql", "redis", "restapi", "grpc"},
    "fullstack":   {"react", "nodejs", "postgresql", "docker", "typescript"},
    "data":        {"python", "sql", "machine_learning", "data_science",
                    "tensorflow", "pytorch"},
    "devops":      {"docker", "kubernetes", "aws", "cicd", "terraform", "linux"},
    "mobile":      {"react_native", "flutter", "ios", "android"},
    "cloud":       {"aws", "azure", "gcp", "kubernetes", "terraform"},
}

EXPERIENCE_KEYWORDS: dict[str, int] = {
    "intern": 0, "internship": 0, "trainee": 0,
    "junior": 1, "jr": 1, "entry level": 1, "entry-level": 1, "fresh grad": 1,
    "mid": 2, "mid-level": 2, "mid level": 2, "intermediate": 2,
    "senior": 3, "sr": 3, "lead": 3,
    "staff": 4, "principal": 4, "architect": 4, "manager": 4,
}

FRESHNESS_HALF_LIFE_DAYS = 30   # score halves every 30 days


class FeatureEngineer:
    """
    Computes FeatureVector for each (UserSkillProfile, JobRecord) pair.
    Designed for batch computation during recommendation pipeline.
    """

    def __init__(self):
        self.extractor = SkillExtractor(use_fuzzy=True)
        self._sbert = None   # lazy

    # ─── SBERT lazy load ───────────────────────────────────────────────────

    def _get_sbert(self):
        if self._sbert is None:
            try:
                from sentence_transformers import SentenceTransformer
                import numpy as np
                self._sbert = SentenceTransformer("all-MiniLM-L6-v2")
                self._np = np
                logger.info("SBERT model loaded for semantic similarity")
            except ImportError:
                logger.warning("sentence-transformers not installed; semantic features set to 0.5")
                self._sbert = False
        return self._sbert if self._sbert is not False else None

    # ─── Main compute ──────────────────────────────────────────────────────

    def compute(
        self,
        user: UserSkillProfile,
        job: JobRecord,
        user_location: Optional[str] = None,
    ) -> FeatureVector:
        """Compute all features for a (user, job) pair."""

        # Ensure job skills are extracted
        if not job.extracted_skills:
            job.extracted_skills = list(
                self.extractor.extract_to_set(job.description, title=job.title)
            )

        job_skills = set(job.extracted_skills)
        user_skills = user.skill_set
        user_profs = user.skills  # skill → proficiency float

        fv = FeatureVector()

        # F1 & F2: skill overlap and coverage
        fv.skill_overlap_score = self._jaccard(user_skills, job_skills)
        fv.skill_coverage_score = self._coverage(user_profs, job_skills)

        # F3: skill gap (normalized)
        matched = user_skills & job_skills
        missing = job_skills - user_skills
        fv.skill_gap_score = len(missing) / max(len(job_skills), 1)

        # F4: skill depth on matched skills
        if matched:
            fv.skill_depth_score = sum(
                user_profs.get(s, 0.5) for s in matched
            ) / len(matched)

        # F5: LP alignment
        fv.lp_alignment_score = self._lp_alignment(
            user.learning_path_title, job_skills
        )

        # F6: experience level match
        fv.experience_level_match = self._experience_match(
            user.raw_progress_pct, job.title, job.experience_level
        )

        # F7 & F8: semantic similarity (SBERT)
        sbert = self._get_sbert()
        if sbert:
            fv.semantic_similarity = self._semantic_sim(
                sbert, user, job
            )
            fv.title_similarity = self._title_sim(
                sbert, user.learning_path_title, job.title
            )
        else:
            # Fallback: use skill overlap as proxy
            fv.semantic_similarity = fv.skill_coverage_score
            fv.title_similarity = fv.lp_alignment_score

        # F9: location
        fv.location_match = self._location_match(
            user_location or "", job.location or ""
        )

        # F10: freshness
        fv.freshness_score = self._freshness(job.posted_at)

        return fv

    def compute_batch(
        self,
        user: UserSkillProfile,
        jobs: list[JobRecord],
        user_location: Optional[str] = None,
    ) -> list[FeatureVector]:
        """Batch compute features for efficiency (single SBERT encode pass)."""
        # Pre-extract skills for all jobs in one pass
        for job in jobs:
            if not job.extracted_skills:
                job.extracted_skills = list(
                    self.extractor.extract_to_set(job.description, title=job.title)
                )

        # Pre-compute SBERT embeddings for all jobs + user profile at once
        sbert = self._get_sbert()
        job_embeddings = None
        user_emb = None

        if sbert:
            try:
                np = self._np
                job_texts = [f"{j.title} {j.description[:512]}" for j in jobs]
                user_text = (
                    f"{user.learning_path_title} "
                    + " ".join(user.skill_set)
                )
                all_texts = [user_text] + job_texts
                all_embs = sbert.encode(
                    all_texts, normalize_embeddings=True, batch_size=32,
                    show_progress_bar=False
                )
                user_emb = all_embs[0]
                job_embeddings = all_embs[1:]
            except Exception as e:
                logger.warning(f"Batch SBERT failed: {e}")

        results = []
        for i, job in enumerate(jobs):
            fv = self.compute(user, job, user_location)
            # Override semantic sim with pre-computed batch embedding
            if sbert and job_embeddings is not None:
                fv.semantic_similarity = float(
                    self._np.dot(user_emb, job_embeddings[i])
                )
            results.append(fv)

        return results

    # ─── Individual feature computations ──────────────────────────────────

    def _jaccard(self, a: set, b: set) -> float:
        union = a | b
        if not union:
            return 0.0
        return len(a & b) / len(union)

    def _coverage(self, user_profs: dict[str, float], job_skills: set[str]) -> float:
        """Weighted: sum of user proficiencies on job skills / num job skills."""
        if not job_skills:
            return 0.5
        total = sum(user_profs.get(s, 0.0) for s in job_skills)
        return total / len(job_skills)

    def _lp_alignment(self, lp_title: str, job_skills: set[str]) -> float:
        """How well does the LP track match the job's skill domain."""
        lp_lower = lp_title.lower()
        best_score = 0.0
        for domain, domain_skills in DOMAIN_SKILL_MAP.items():
            if domain in lp_lower:
                overlap = len(job_skills & domain_skills) / max(len(domain_skills), 1)
                best_score = max(best_score, overlap)
        return best_score

    def _experience_match(
        self,
        progress_pct: float,
        job_title: str,
        job_exp_level: Optional[str],
    ) -> float:
        """
        Maps user learning progress to inferred experience level,
        then computes match with job's required level.
        Returns: 1.0 (perfect) → 0.5 (neutral) → 0.0 (major mismatch)
        """
        # Infer user level from progress
        if progress_pct < 30:
            user_level = 0   # junior / beginner
        elif progress_pct < 60:
            user_level = 1   # mid-junior
        elif progress_pct < 85:
            user_level = 2   # mid
        else:
            user_level = 3   # senior

        # Parse job level from title + explicit field
        text = f"{job_title} {job_exp_level or ''}".lower()
        job_level = 1   # default to junior if unknown
        for kw, lvl in EXPERIENCE_KEYWORDS.items():
            if kw in text:
                job_level = lvl
                break

        diff = abs(user_level - job_level)
        if diff == 0:
            return 1.0
        elif diff == 1:
            return 0.7
        elif diff == 2:
            return 0.4
        else:
            return 0.1

    def _semantic_sim(self, sbert, user: UserSkillProfile, job: JobRecord) -> float:
        """Cosine similarity between user profile and job description."""
        try:
            np = self._np
            user_text = f"{user.learning_path_title} " + " ".join(user.skill_set)
            job_text = f"{job.title} {job.description[:512]}"
            embs = sbert.encode([user_text, job_text], normalize_embeddings=True)
            return float(np.dot(embs[0], embs[1]))
        except Exception:
            return 0.5

    def _title_sim(self, sbert, lp_title: str, job_title: str) -> float:
        try:
            np = self._np
            embs = sbert.encode([lp_title, job_title], normalize_embeddings=True)
            return float(np.dot(embs[0], embs[1]))
        except Exception:
            return 0.5

    def _location_match(self, user_loc: str, job_loc: str) -> float:
        if not user_loc or not job_loc:
            return 0.5
        u = user_loc.lower()
        j = job_loc.lower()
        if "remote" in j or "anywhere" in j:
            return 1.0
        # City-level match
        u_parts = [p.strip() for p in u.replace(",", " ").split()]
        j_parts = [p.strip() for p in j.replace(",", " ").split()]
        common = set(u_parts) & set(j_parts)
        if len(common) >= 2:
            return 0.9
        if len(common) == 1:
            return 0.6
        return 0.2

    def _freshness(self, posted_at: Optional[datetime]) -> float:
        if posted_at is None:
            return 0.7   # unknown → assume somewhat fresh
        now = datetime.now(timezone.utc)
        if posted_at.tzinfo is None:
            posted_at = posted_at.replace(tzinfo=timezone.utc)
        days_old = (now - posted_at).days
        return math.exp(-days_old * math.log(2) / FRESHNESS_HALF_LIFE_DAYS)


# ─────────────────────────────────────────────────────────────────────────────
# Explanation Generator
# ─────────────────────────────────────────────────────────────────────────────

def generate_explanation(
    user: UserSkillProfile,
    job: JobRecord,
    fv: FeatureVector,
    score: float,
    shap_values: Optional[dict[str, float]] = None,
) -> RecommendationResult:
    """
    Builds a human-readable explanation and RecommendationResult.
    Uses SHAP values if available; falls back to rule-based explanations.
    """
    job_skills = set(job.extracted_skills)
    user_skills = user.skill_set

    matched = sorted(job_skills & user_skills)
    missing = sorted(job_skills - user_skills)
    skill_gap_pct = len(missing) / max(len(job_skills), 1)

    explanations = []

    # ── Matched skills ──────────────────────────────────
    if matched:
        if len(matched) <= 5:
            explanations.append(
                f"✅ Matched skills: {', '.join(matched)}"
            )
        else:
            top_matched = matched[:5]
            explanations.append(
                f"✅ Matched {len(matched)} skills including: "
                f"{', '.join(top_matched)} and {len(matched)-5} more"
            )

    # ── Missing skills ──────────────────────────────────
    if missing:
        pct = round(skill_gap_pct * 100)
        if len(missing) <= 3:
            explanations.append(
                f"⚠️  Skill gap ({pct}%): {', '.join(missing)}"
            )
        else:
            explanations.append(
                f"⚠️  Skill gap ({pct}%): {len(missing)} skills missing — "
                f"main gaps: {', '.join(missing[:3])}"
            )

    # ── LP alignment ────────────────────────────────────
    lp_pct = round(user.raw_progress_pct)
    if fv.lp_alignment_score > 0.6:
        explanations.append(
            f"🎯 Strong learning path alignment — "
            f"'{user.learning_path_title}' is {lp_pct}% complete"
        )
    elif fv.lp_alignment_score > 0.3:
        explanations.append(
            f"📚 Moderate LP alignment — "
            f"'{user.learning_path_title}' ({lp_pct}% progress) covers some of this role"
        )

    # ── Experience level ────────────────────────────────
    if fv.experience_level_match >= 0.9:
        explanations.append("🏆 Job level matches your current profile")
    elif fv.experience_level_match < 0.4:
        explanations.append("📈 This job may be a stretch — consider it a growth target")

    # ── Semantic relevance ──────────────────────────────
    if fv.semantic_similarity > 0.75:
        explanations.append(
            "🔍 High semantic relevance between your profile and this job"
        )

    # ── Freshness ───────────────────────────────────────
    if fv.freshness_score > 0.9:
        explanations.append("🕐 Recently posted — high application priority")

    # ── SHAP-based feature importance (if available) ───
    if shap_values:
        top_feat = max(shap_values, key=lambda k: abs(shap_values[k]))
        top_val = shap_values[top_feat]
        direction = "boosted" if top_val > 0 else "reduced"
        feat_label = top_feat.replace("_", " ")
        explanations.append(
            f"📊 Score {direction} most by: {feat_label} "
            f"(SHAP: {top_val:+.3f})"
        )

    return RecommendationResult(
        job_id=job.id,
        title=job.title,
        company=job.company,
        location=job.location,
        job_type=job.job_type,
        apply_link=job.apply_link,
        learning_path_id=job.learning_path_id,
        score=round(score, 4),
        features=fv,
        explanation=explanations,
        matched_skills=matched,
        missing_skills=missing,
        skill_gap_pct=round(skill_gap_pct, 3),
    )
