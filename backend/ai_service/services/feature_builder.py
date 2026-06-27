"""
feature_builder.py
Unified feature computation for AI Job Recommendation — LP-Student Optimized.

v5.1 — Skill-Overlap-First:
  • skill_overlap هو الملك (weight ×10 في الـ score)
  • lp_alignment = skill_overlap × domain_match (مش مستقل)
  • career_alignment = |u ∩ j| / |j|  (coverage من منظور الوظيفة)
  • freshness = multiplier (0.7→1.0) مش additive feature
  • learning_gap_score = jobDifficulty − skillOverlap (سالب قوي)
  • exp_match = np.nan دايماً (مش applicable للطلاب)
  • readiness = skillOverlap / jobDifficulty (للعرض بس)
"""
import math
from typing import Optional
import numpy as np
import pandas as pd

from .skill_normalizer import SkillNormalizer
import logging
log = logging.getLogger("feature_builder")

# ── Unified Feature Contract (اللي الموديل بيتدرب عليه) ──────────────────
FEATURES = [
    "retrieval_score",
    "skill_overlap",
    "exp_match",
    "freshness",
    "career_alignment",
    "learning_gap_score",
    "lp_alignment",
    "user_skill_density",
    "job_skill_difficulty",
]


class FeatureBuilder:
    """
    Builds the 9 unified features for a (user, job, retrieval_score) triple.

    Logic for LP-based learners:
      - skill_overlap هو الملك: |u ∩ j| / |u ∪ j|
      - lp_alignment = skill_overlap × domain_match (0.8→1.0 لو نفس المجال)
      - career_alignment = |u ∩ j| / |j|  (coverage من منظور الوظيفة)
      - freshness = multiplier (0.7 + 0.3×raw_freshness) مش additive
      - exp_match = np.nan  (learners have no prior experience)
    """

    def __init__(self, normalizer: SkillNormalizer = None):
        self.normalizer = normalizer or SkillNormalizer()

    def build(
        self,
        user,
        job,
        retrieval_score: Optional[float],
        jobs_df: Optional[pd.DataFrame] = None,
    ) -> dict:
        """
        Compute all 9 features. Missing/unknowable values become np.nan.
        """
        u_skills = self._user_skills(user)
        j_skills = self._job_skills(job)

        # ── 1. retrieval_score (من FAISS — external) ─────────────────────────
        feat_retrieval = float(retrieval_score) if retrieval_score is not None else np.nan

        # ── 2. skill_overlap — Jaccard: |u ∩ j| / |u ∪ j| ────────────────────
        if not u_skills or not j_skills:
            feat_overlap = np.nan
        else:
            feat_overlap = self.normalizer.overlap(u_skills, j_skills)

        # ── 3. exp_match — NOT applicable for learners ─────────────────────
        feat_exp = np.nan

        # ── 4. freshness — multiplier (0.7 → 1.0) ──────────────────────────
        posted_at = getattr(job, "postedAt", None)
        if posted_at:
            try:
                posted = pd.to_datetime(posted_at, utc=True)
                days = (pd.Timestamp.now(tz="UTC") - posted).days
                raw_fresh = float(np.clip(1.0 - days / 180.0, 0, 1))
                feat_fresh = float(0.7 + 0.3 * raw_fresh)
            except Exception:
                feat_fresh = np.nan
        else:
            feat_fresh = np.nan

        # ── 5. career_alignment — |u ∩ j| / |j| ──────────────────────────────
        if not u_skills or not j_skills or math.isnan(feat_overlap):
            feat_career = np.nan
        else:
            feat_career = float(len(u_skills & j_skills) / len(j_skills))

        # ── 6. user_skill_density — how far along the LP ───────────────────
        if not u_skills:
            feat_u_density = np.nan
        else:
            feat_u_density = float(min(len(u_skills), 20) / 20.0)

        # ── 7. job_skill_difficulty — demanding by skill count ─────────────
        if not j_skills:
            feat_j_diff = np.nan
        else:
            feat_j_diff = float(min(len(j_skills), 15) / 15.0)

        # ── 8. learning_gap_score — effort needed ──────────────────────────
        if math.isnan(feat_j_diff) or math.isnan(feat_overlap):
            feat_gap = np.nan
        else:
            feat_gap = float(np.clip(feat_j_diff - feat_overlap, 0, 1))

        # ── 9. lp_alignment — skill_overlap × domain_match ────────────────
        if math.isnan(feat_overlap):
            feat_lp = np.nan
        else:
            domain_match = self._domain_match(user, job)
            feat_lp = float(np.clip(feat_overlap * domain_match, 0, 1))

        return {
            "retrieval_score": feat_retrieval,
            "skill_overlap": feat_overlap,
            "exp_match": feat_exp,
            "freshness": feat_fresh,
            "career_alignment": feat_career,
            "learning_gap_score": feat_gap,
            "lp_alignment": feat_lp,
            "user_skill_density": feat_u_density,
            "job_skill_difficulty": feat_j_diff,
        }

    def compute_score(self, features: dict) -> float:
        """
        Skill-first scoring — overlap=0 يعني score قريب من 0 فعلاً.
        """
        f = features
        log.warning(f"compute_score called — overlap={features.get('skill_overlap')} gap={features.get('learning_gap_score')}")

        def safe(key, default=0.0):
            v = f.get(key, default)
            return default if (isinstance(v, float) and math.isnan(v)) else v

        overlap    = safe("skill_overlap")
        lp         = safe("lp_alignment")
        career     = safe("career_alignment")
        gap        = safe("learning_gap_score")
        density    = safe("user_skill_density")
        difficulty = safe("job_skill_difficulty")
        retrieval  = safe("retrieval_score")
        fresh      = safe("freshness", 0.85)

        # ── Guard: لو overlap صغير جداً → score سالب مباشرة ──────────────
        if overlap < 0.05:
            return float(np.clip(-gap * 0.5, -1.0, 0.0))

        # ── Base score: overlap هو الـ gate ──────────────────────────────
        base = (
            overlap    * 10.0   # الملك
            + lp       *  2.0   # domain bonus
            + career   *  1.5   # coverage bonus
            - gap      *  5.0   # penalty قوي على الفجوة
            + density  *  0.3   # bonus بسيط للطالب المتقدم
            - difficulty*  0.5  # penalty بسيط على الصعوبة
            + retrieval*  0.5   # FAISS signal
        )

        # ── Freshness كـ multiplier ───────────────────────────────────────
        score = base * fresh

        # ── Normalize إلى [-1, 1] ─────────────────────────────────────────
        return float(np.clip(score / 10.0, -1.0, 1.0))

    def compute_display_features(self, features: dict) -> dict:
        """
        Compute display-only features (readiness, skillGapPct).
        """
        f = features

        def safe(key):
            v = f.get(key, np.nan)
            return 0.0 if (isinstance(v, float) and math.isnan(v)) else float(v)

        overlap    = safe("skill_overlap")
        difficulty = safe("job_skill_difficulty")
        gap        = safe("learning_gap_score")

        readiness     = float(np.clip(overlap / max(difficulty, 0.1), 0, 1))
        skill_gap_pct = float(np.clip(gap * 100, 0, 100))

        return {
            "readiness":    round(readiness, 3),
            "skillGapPct":  round(skill_gap_pct, 1),
        }

    def _domain_match(self, user, job) -> float:
        """
        Return 1.0 if job domain matches user LP, 0.3 if opposite, 0.8 neutral.
        """
        user_lp    = getattr(user, "lpTitle", "") or getattr(user, "learningPath", "") or ""
        job_title  = getattr(job, "title", "") or ""

        if not user_lp or not job_title:
            return 0.8

        user_lp_lower    = user_lp.lower()
        job_title_lower  = job_title.lower()

        frontend_kw  = ["frontend", "front-end", "front end", "react", "angular", "vue"]
        backend_kw   = ["backend", "back-end", "node", "python", "java", "php"]
        fullstack_kw = ["fullstack", "full-stack", "full stack"]

        user_is_frontend  = any(k in user_lp_lower for k in frontend_kw)
        user_is_backend   = any(k in user_lp_lower for k in backend_kw)
        user_is_fullstack = any(k in user_lp_lower for k in fullstack_kw)

        job_is_frontend   = any(k in job_title_lower for k in frontend_kw)
        job_is_backend    = any(k in job_title_lower for k in backend_kw)
        job_is_fullstack  = any(k in job_title_lower for k in fullstack_kw)

        if user_is_fullstack and (job_is_frontend or job_is_backend or job_is_fullstack):
            return 1.0
        if user_is_frontend and job_is_frontend:
            return 1.0
        if user_is_backend and job_is_backend:
            return 1.0
        if (user_is_frontend and job_is_backend) or (user_is_backend and job_is_frontend):
            return 0.3

        return 0.8

    def _user_skills(self, user) -> frozenset:
        """Aggregate and normalize all user skills from LP progress."""
        raw = []
        if hasattr(user, "skills") and user.skills:
            raw.extend(user.skills)
        if hasattr(user, "declaredSkills") and user.declaredSkills:
            raw.extend(user.declaredSkills)
        return self.normalizer.parse(raw)

    def _job_skills(self, job) -> frozenset:
        """Extract and normalize job skills."""
        if hasattr(job, "skills") and job.skills:
            parsed = self.normalizer.parse(job.skills)
            if parsed:
                return parsed
        return frozenset()