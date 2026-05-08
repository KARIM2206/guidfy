"""
NLP Skill Extractor
====================
Extracts skills from raw noisy job descriptions/titles using:
- Pattern matching (fast, high precision)
- spaCy NER + custom patterns
- Synonym normalization (React == Next.js == "frontend frameworks")
- SBERT-based fuzzy skill matching for unknown terms

Designed for real-world scraped data: noisy, inconsistent, multilingual labels.
"""

import re
import json
from dataclasses import dataclass, field
from typing import Optional
import logging

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# SKILL TAXONOMY  (normalized_name → [aliases, abbreviations, synonyms])
# ─────────────────────────────────────────────────────────────────────────────
SKILL_TAXONOMY: dict[str, list[str]] = {
    # Frontend
    "react":           ["react.js", "reactjs", "react js", "react native"],
    "nextjs":          ["next.js", "next js", "nextjs"],
    "angular":         ["angularjs", "angular.js", "angular 2+", "angular2"],
    "vue":             ["vue.js", "vuejs", "vue js", "nuxt", "nuxt.js"],
    "typescript":      ["ts", "typescript", "typed javascript"],
    "javascript":      ["js", "javascript", "es6", "es2015", "ecmascript", "vanilla js"],
    "html":            ["html5", "html/css", "markup"],
    "css":             ["css3", "scss", "sass", "less", "tailwind", "tailwindcss",
                        "bootstrap", "material ui", "styled-components"],
    "redux":           ["redux toolkit", "zustand", "mobx", "state management"],
    "graphql":         ["graph ql", "graphql api"],
    "webpack":         ["webpack", "vite", "rollup", "bundler"],

    # Backend
    "nodejs":          ["node.js", "node js", "express", "expressjs", "express.js",
                        "nestjs", "nest.js", "koa", "fastify"],
    "python":          ["python3", "python 3", "py"],
    "django":          ["django rest framework", "drf"],
    "fastapi":         ["fast api"],
    "flask":           ["flask api"],
    "java":            ["java 8", "java 11", "java 17", "spring", "spring boot",
                        "spring framework"],
    "dotnet":          [".net", "asp.net", "c#", "csharp", ".net core"],
    "php":             ["laravel", "symfony", "php8"],
    "ruby":            ["ruby on rails", "rails", "ror"],
    "golang":          ["go lang", "go language", "golang"],
    "rust":            ["rust lang"],
    "scala":           ["scala", "akka"],
    "kotlin":          ["kotlin"],
    "swift":           ["swift ui", "swiftui"],

    # Databases
    "postgresql":      ["postgres", "pg", "psql", "postgresql"],
    "mysql":           ["mariadb", "mysql"],
    "mongodb":         ["mongo", "mongoose"],
    "redis":           ["redis cache"],
    "elasticsearch":   ["elastic search", "elk stack", "opensearch"],
    "cassandra":       ["apache cassandra"],
    "dynamodb":        ["dynamo db", "aws dynamodb"],
    "sqlite":          ["sqlite3"],

    # Cloud / DevOps
    "aws":             ["amazon web services", "ec2", "s3", "lambda", "ecs", "eks",
                        "cloudformation", "aws cloud"],
    "azure":           ["microsoft azure", "azure devops"],
    "gcp":             ["google cloud", "google cloud platform", "gke", "bigquery"],
    "docker":          ["dockerfile", "docker compose", "containerization"],
    "kubernetes":      ["k8s", "kubectl", "helm", "container orchestration"],
    "terraform":       ["infrastructure as code", "iac", "terraform"],
    "cicd":            ["ci/cd", "github actions", "gitlab ci", "jenkins", "circleci",
                        "travis ci", "continuous integration", "continuous deployment"],
    "linux":           ["unix", "bash", "shell scripting", "ubuntu", "centos"],
    "nginx":           ["apache", "reverse proxy"],

    # AI / ML
    "machine_learning":["ml", "machine learning", "sklearn", "scikit-learn",
                        "supervised learning", "unsupervised learning"],
    "deep_learning":   ["dl", "deep learning", "neural network", "neural networks"],
    "pytorch":         ["pytorch", "torch"],
    "tensorflow":      ["tf", "tensorflow", "keras"],
    "nlp":             ["natural language processing", "nlp", "transformers",
                        "huggingface", "hugging face", "bert", "gpt"],
    "data_science":    ["data science", "data analysis", "pandas", "numpy",
                        "matplotlib", "seaborn", "jupyter"],
    "sql":             ["sql queries", "t-sql", "pl/sql", "stored procedures"],

    # Architecture / Practices
    "microservices":   ["micro services", "microservice architecture", "soa",
                        "service oriented architecture"],
    "restapi":         ["rest api", "restful", "rest", "http api", "web api"],
    "grpc":            ["grpc", "protocol buffers", "protobuf"],
    "kafka":           ["apache kafka", "event streaming", "message queue"],
    "rabbitmq":        ["rabbit mq", "amqp", "message broker"],
    "git":             ["github", "gitlab", "bitbucket", "version control", "git flow"],
    "agile":           ["scrum", "kanban", "sprint", "jira", "agile methodology"],
    "tdd":             ["test driven development", "unit testing", "jest", "pytest",
                        "mocha", "cypress", "selenium", "testing"],
    "system_design":   ["system design", "high availability", "scalability",
                        "distributed systems", "load balancing"],

    # Mobile
    "react_native":    ["react native", "rn"],
    "flutter":         ["flutter", "dart"],
    "ios":             ["ios development", "xcode", "objective-c"],
    "android":         ["android development", "android sdk"],
}

# Build reverse lookup: alias → canonical
_ALIAS_MAP: dict[str, str] = {}
for canonical, aliases in SKILL_TAXONOMY.items():
    _ALIAS_MAP[canonical] = canonical
    for alias in aliases:
        _ALIAS_MAP[alias.lower()] = canonical


@dataclass
class ExtractedSkill:
    canonical: str          # normalized skill name
    raw_mention: str        # exactly what was found in text
    confidence: float       # 0.0 – 1.0
    source: str             # "pattern" | "fuzzy" | "ner"


class SkillExtractor:
    """
    Extracts and normalizes skills from raw job text.

    Usage:
        extractor = SkillExtractor()
        skills = extractor.extract("We need a Next.js developer with 3+ yrs React...")
        # → [ExtractedSkill(canonical='nextjs', ...), ExtractedSkill(canonical='react', ...)]
    """

    def __init__(self, use_fuzzy: bool = True, fuzzy_threshold: float = 0.82):
        self.use_fuzzy = use_fuzzy
        self.fuzzy_threshold = fuzzy_threshold
        self._compiled = self._build_patterns()
        self._sbert_model = None   # lazy loaded

    # ─── Pattern compilation ───────────────────────────────────────────────

    def _build_patterns(self) -> list[tuple[re.Pattern, str]]:
        """Compile all aliases into regex patterns sorted longest-first."""
        pairs = []
        for alias, canonical in sorted(_ALIAS_MAP.items(), key=lambda x: -len(x[0])):
            # Word-boundary aware, case insensitive, allow dots and slashes in alias
            escaped = re.escape(alias)
            pattern = re.compile(
                r'(?<![a-z0-9_\-\./])' + escaped + r'(?![a-z0-9_\-\./])',
                re.IGNORECASE
            )
            pairs.append((pattern, canonical))
        return pairs

    # ─── Core extraction ───────────────────────────────────────────────────

    def extract(self, text: str, include_title: str = "") -> list[ExtractedSkill]:
        """
        Main entry point.  Merges results from title + description.
        Returns deduplicated list of ExtractedSkill sorted by confidence desc.
        """
        combined = f"{include_title} {text}" if include_title else text
        combined = self._preprocess(combined)

        found: dict[str, ExtractedSkill] = {}

        # 1. Fast pattern matching
        for skill in self._pattern_extract(combined):
            key = skill.canonical
            if key not in found or skill.confidence > found[key].confidence:
                found[key] = skill

        # 2. Fuzzy SBERT fallback for unknown noun phrases (optional)
        if self.use_fuzzy:
            for skill in self._fuzzy_extract(combined, already_found=set(found.keys())):
                if skill.canonical not in found:
                    found[skill.canonical] = skill

        return sorted(found.values(), key=lambda s: -s.confidence)

    def extract_to_set(self, text: str, title: str = "") -> set[str]:
        """Returns set of canonical skill names (convenience wrapper)."""
        return {s.canonical for s in self.extract(text, include_title=title)}

    # ─── Stage 1: Pattern matching ─────────────────────────────────────────

    def _preprocess(self, text: str) -> str:
        """Normalize whitespace, remove HTML tags, collapse bullets."""
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'[•·●▪■◆➤→\-–—]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _pattern_extract(self, text: str) -> list[ExtractedSkill]:
        results = []
        seen_spans: list[tuple[int, int]] = []

        for pattern, canonical in self._compiled:
            for match in pattern.finditer(text):
                span = (match.start(), match.end())
                # Skip if overlapping with already matched span
                if any(s[0] <= span[0] < s[1] or s[0] < span[1] <= s[1]
                       for s in seen_spans):
                    continue
                seen_spans.append(span)
                results.append(ExtractedSkill(
                    canonical=canonical,
                    raw_mention=match.group(),
                    confidence=1.0,
                    source="pattern"
                ))
        return results

    # ─── Stage 2: SBERT fuzzy matching ────────────────────────────────────

    def _get_sbert(self):
        if self._sbert_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                # استخدم المسار الكامل للمجلد المحلي
                local_model_path = r"C:\Users\TECHNO\.cache\huggingface\hub\models--sentence-transformers--all-MiniLM-L6-v2\snapshots\c9745ed1d9f207416be6d2e6f8de32d1f16199bf"
                self._sbert_model = SentenceTransformer(local_model_path)
                logger.info("SBERT model loaded from local cache")
            except ImportError:
                logger.warning("sentence-transformers not installed; fuzzy matching disabled")
                self._sbert_model = False
        return self._sbert_model if self._sbert_model is not False else None

    def _fuzzy_extract(self, text: str, already_found: set[str]) -> list[ExtractedSkill]:
        """
        Extract noun phrases from text, embed them, and find closest known skill.
        Only adds skills not already found by pattern matching.
        """
        model = self._get_sbert()
        if model is None:
            return []

        try:
            import numpy as np
            # Extract candidate noun phrases (2-4 tokens, title-case or code-like)
            candidates = self._extract_candidates(text)
            if not candidates:
                return []

            canonical_skills = [k for k in SKILL_TAXONOMY.keys()
                                 if k not in already_found]
            if not canonical_skills:
                return []

            cand_embeddings = model.encode(candidates, normalize_embeddings=True)
            skill_embeddings = model.encode(canonical_skills, normalize_embeddings=True)
            sims = cand_embeddings @ skill_embeddings.T  # (C, S)

            results = []
            for i, cand in enumerate(candidates):
                best_idx = int(np.argmax(sims[i]))
                best_sim = float(sims[i, best_idx])
                if best_sim >= self.fuzzy_threshold:
                    results.append(ExtractedSkill(
                        canonical=canonical_skills[best_idx],
                        raw_mention=cand,
                        confidence=best_sim,
                        source="fuzzy"
                    ))
            return results

        except Exception as e:
            logger.debug(f"Fuzzy extraction failed: {e}")
            return []

    def _extract_candidates(self, text: str) -> list[str]:
        """Extract short candidate phrases that look like tech skills."""
        # Match things like: "Next.js", "GraphQL", "CI/CD", "gRPC", "AWS EC2"
        pattern = re.compile(
            r'\b(?:[A-Z][a-z]+(?:\.?[A-Z][a-z]*)*|[A-Z]{2,}(?:[0-9.]+)?'
            r'|[a-z]+(?:\.[a-z]+)+)\b'
        )
        candidates = pattern.findall(text)
        # Filter out common English words and very short tokens
        stopwords = {"the", "and", "for", "with", "using", "years", "team",
                     "must", "will", "have", "able", "work", "our", "your"}
        return [c for c in candidates
                if len(c) >= 2 and c.lower() not in stopwords][:60]


# ─────────────────────────────────────────────────────────────────────────────
# Learning Path → Skill Vector
# ─────────────────────────────────────────────────────────────────────────────

# Maps LP titles/modules to skills they teach (admin-configurable)
LP_SKILL_MAP: dict[str, list[str]] = {
    "frontend":         ["html", "css", "javascript", "typescript", "react",
                         "nextjs", "vue", "redux", "webpack"],
    "backend":          ["nodejs", "python", "restapi", "postgresql", "redis",
                         "docker", "microservices"],
    "fullstack":        ["html", "css", "javascript", "react", "nodejs",
                         "postgresql", "docker", "git"],
    "data science":     ["python", "sql", "machine_learning", "data_science",
                         "pandas", "numpy"],
    "devops":           ["linux", "docker", "kubernetes", "aws", "cicd",
                         "terraform", "git"],
    "mobile":           ["react_native", "flutter", "ios", "android",
                         "javascript", "typescript"],
    "machine learning": ["python", "machine_learning", "deep_learning",
                         "pytorch", "tensorflow", "nlp", "data_science"],
    "cloud":            ["aws", "azure", "gcp", "docker", "kubernetes",
                         "terraform", "cicd"],
}


@dataclass
class UserSkillProfile:
    """Represents a user's skill state derived from learning path progress."""
    user_id: int
    skills: dict[str, float]        # canonical_skill → proficiency 0.0–1.0
    learning_path_title: str = ""
    raw_progress_pct: float = 0.0

    @property
    def skill_set(self) -> set[str]:
        return {k for k, v in self.skills.items() if v > 0.3}


def build_user_skill_profile(
    user_id: int,
    learning_path_title: str,
    progress_percent: float,         # 0–100
    user_declared_skills: list[str] | None = None,
) -> UserSkillProfile:
    """
    Converts a user's learning path enrollment + progress into a skill vector.

    Args:
        user_id:               DB user ID
        learning_path_title:   e.g. "Frontend Developer Track"
        progress_percent:      0–100 from UserLearningPath / step progress
        user_declared_skills:  optional manual skills the user added

    Returns:
        UserSkillProfile with proficiency scores per skill
    """
    progress = progress_percent / 100.0
    skills: dict[str, float] = {}

    # Match LP title to known tracks (fuzzy keyword match)
    lp_lower = learning_path_title.lower()
    matched_track = None
    for track_key in LP_SKILL_MAP:
        if track_key in lp_lower:
            matched_track = track_key
            break

    if matched_track:
        track_skills = LP_SKILL_MAP[matched_track]
        total = len(track_skills)
        for i, skill in enumerate(track_skills):
            # Skills learned earlier in the track get higher scores for same progress
            # First 30% of skills = "foundation skills"
            position_factor = 1.0 - (i / total) * 0.4
            skills[skill] = min(1.0, progress * position_factor)

    # Add user-declared skills (full confidence if declared)
    extractor = SkillExtractor(use_fuzzy=False)
    if user_declared_skills:
        for raw_skill in user_declared_skills:
            extracted = extractor.extract(raw_skill)
            for es in extracted:
                # Declared skills override LP-derived if higher
                skills[es.canonical] = max(skills.get(es.canonical, 0.0), 0.9)

    return UserSkillProfile(
        user_id=user_id,
        skills=skills,
        learning_path_title=learning_path_title,
        raw_progress_pct=progress_percent,
    )
