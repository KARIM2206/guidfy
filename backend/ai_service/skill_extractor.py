"""
skill_extractor.py  —  v4.0  Production-Grade
==============================================

Architecture (7 layers)
------------------------
L0  Pre-processing     — clean, normalise text
L1  Phrase Matching    — spaCy PhraseMatcher (multi-word first)
L2  Regex              — compiled patterns for exact + alias hits
L3  Semantic SBERT     — sentence-level embedding similarity
L4  Normalisation      — canonical mapping, dedup
L5  Confidence Scoring — source-weighted, location-boosted
L6  False-Positive     — blocklist + context guard

All layers are CPU-only, deterministic, import-safe.
"""

from __future__ import annotations

import json
import logging
import re
import string
import time
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Optional

import numpy as np
import pandas as pd

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────

log = logging.getLogger("skill_extractor")
if not log.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    )


# ═════════════════════════════════════════════════════════════════════════════
# 1.  CANONICAL SKILL TAXONOMY
# ═════════════════════════════════════════════════════════════════════════════

# Single source of truth — canonical form is the key
TECH_SKILLS: dict[str, dict] = {
    # ── Languages ────────────────────────────────────────────────────────────
    "python":       {"category": "language", "weight": 1.0},
    "javascript":   {"category": "language", "weight": 1.0},
    "typescript":   {"category": "language", "weight": 1.0},
    "java":         {"category": "language", "weight": 1.0},
    "c#":           {"category": "language", "weight": 1.0},
    "c++":          {"category": "language", "weight": 1.0},
    "go":           {"category": "language", "weight": 1.0},
    "rust":         {"category": "language", "weight": 1.0},
    "php":          {"category": "language", "weight": 1.0},
    "ruby":         {"category": "language", "weight": 1.0},
    "swift":        {"category": "language", "weight": 1.0},
    "kotlin":       {"category": "language", "weight": 1.0},
    "scala":        {"category": "language", "weight": 1.0},
    "dart":         {"category": "language", "weight": 1.0},
    "r":            {"category": "language", "weight": 0.8},
    "matlab":       {"category": "language", "weight": 0.9},
    "elixir":       {"category": "language", "weight": 0.9},

    # ── Front-end ─────────────────────────────────────────────────────────────
    "react":            {"category": "frontend", "weight": 1.0},
    "vue":              {"category": "frontend", "weight": 1.0},
    "angular":          {"category": "frontend", "weight": 1.0},
    "svelte":           {"category": "frontend", "weight": 0.9},
    "next.js":          {"category": "frontend", "weight": 1.0},
    "nuxt":             {"category": "frontend", "weight": 0.9},
    "html":             {"category": "frontend", "weight": 0.8},
    "css":              {"category": "frontend", "weight": 0.8},
    "tailwind":         {"category": "frontend", "weight": 1.0},
    "bootstrap":        {"category": "frontend", "weight": 0.9},
    "webpack":          {"category": "frontend", "weight": 0.9},
    "vite":             {"category": "frontend", "weight": 0.9},
    "redux":            {"category": "frontend", "weight": 1.0},
    "redux toolkit":    {"category": "frontend", "weight": 1.0},

    # ── Back-end ──────────────────────────────────────────────────────────────
    "node.js":      {"category": "backend", "weight": 1.0},
    "express":      {"category": "backend", "weight": 1.0},
    "django":       {"category": "backend", "weight": 1.0},
    "flask":        {"category": "backend", "weight": 1.0},
    "fastapi":      {"category": "backend", "weight": 1.0},
    "spring":       {"category": "backend", "weight": 1.0},
    "laravel":      {"category": "backend", "weight": 1.0},
    "rails":        {"category": "backend", "weight": 1.0},
    "graphql":      {"category": "backend", "weight": 1.0},
    "rest api":     {"category": "backend", "weight": 1.0},
    "grpc":         {"category": "backend", "weight": 0.9},
    "socket.io":    {"category": "backend", "weight": 0.9},
    "websocket":    {"category": "backend", "weight": 0.9},
    "stripe":       {"category": "backend", "weight": 1.0},

    # ── Databases ─────────────────────────────────────────────────────────────
    "postgresql":       {"category": "database", "weight": 1.0},
    "mysql":            {"category": "database", "weight": 1.0},
    "mongodb":          {"category": "database", "weight": 1.0},
    "redis":            {"category": "database", "weight": 1.0},
    "elasticsearch":    {"category": "database", "weight": 1.0},
    "sqlite":           {"category": "database", "weight": 0.8},
    "cassandra":        {"category": "database", "weight": 0.9},
    "dynamodb":         {"category": "database", "weight": 0.9},
    "neo4j":            {"category": "database", "weight": 0.9},
    "snowflake":        {"category": "database", "weight": 0.9},
    "bigquery":         {"category": "database", "weight": 0.9},
    "redshift":         {"category": "database", "weight": 0.9},
    "databricks":       {"category": "database", "weight": 0.9},
    "sql":              {"category": "database", "weight": 0.9},

    # ── AI / ML ───────────────────────────────────────────────────────────────
    "machine learning":     {"category": "ai_ml", "weight": 1.0},
    "deep learning":        {"category": "ai_ml", "weight": 1.0},
    "nlp":                  {"category": "ai_ml", "weight": 1.0},
    "llm":                  {"category": "ai_ml", "weight": 1.0},
    "prompt engineering":   {"category": "ai_ml", "weight": 1.0},
    "rag":                  {"category": "ai_ml", "weight": 1.0},
    "fine-tuning":          {"category": "ai_ml", "weight": 1.0},
    "embeddings":           {"category": "ai_ml", "weight": 1.0},
    "vector databases":     {"category": "ai_ml", "weight": 1.0},
    "tensorflow":           {"category": "ai_ml", "weight": 1.0},
    "pytorch":              {"category": "ai_ml", "weight": 1.0},
    "keras":                {"category": "ai_ml", "weight": 1.0},
    "scikit-learn":         {"category": "ai_ml", "weight": 1.0},
    "xgboost":              {"category": "ai_ml", "weight": 0.9},
    "lightgbm":             {"category": "ai_ml", "weight": 0.9},
    "huggingface":          {"category": "ai_ml", "weight": 1.0},
    "transformers":         {"category": "ai_ml", "weight": 1.0},
    "openai api":           {"category": "ai_ml", "weight": 1.0},
    "langchain":            {"category": "ai_ml", "weight": 1.0},
    "pinecone":             {"category": "ai_ml", "weight": 1.0},
    "weaviate":             {"category": "ai_ml", "weight": 0.9},
    "chromadb":             {"category": "ai_ml", "weight": 0.9},
    "mlflow":               {"category": "ai_ml", "weight": 0.9},
    "pandas":               {"category": "ai_ml", "weight": 0.9},
    "numpy":                {"category": "ai_ml", "weight": 0.9},
    "data preprocessing":   {"category": "ai_ml", "weight": 1.0},
    "artificial intelligence": {"category": "ai_ml", "weight": 1.0},

    # ── Cloud / DevOps ────────────────────────────────────────────────────────
    "aws":              {"category": "devops", "weight": 1.0},
    "azure":            {"category": "devops", "weight": 1.0},
    "gcp":              {"category": "devops", "weight": 1.0},
    "docker":           {"category": "devops", "weight": 1.0},
    "kubernetes":       {"category": "devops", "weight": 1.0},
    "terraform":        {"category": "devops", "weight": 1.0},
    "ansible":          {"category": "devops", "weight": 0.9},
    "helm":             {"category": "devops", "weight": 0.9},
    "ci/cd":            {"category": "devops", "weight": 1.0},
    "jenkins":          {"category": "devops", "weight": 0.9},
    "github actions":   {"category": "devops", "weight": 1.0},
    "gitlab ci":        {"category": "devops", "weight": 0.9},
    "linux":            {"category": "devops", "weight": 0.9},
    "bash":             {"category": "devops", "weight": 0.9},
    "nginx":            {"category": "devops", "weight": 0.9},

    # ── Data Engineering ──────────────────────────────────────────────────────
    "spark":    {"category": "data_eng", "weight": 1.0},
    "kafka":    {"category": "data_eng", "weight": 1.0},
    "airflow":  {"category": "data_eng", "weight": 1.0},
    "dbt":      {"category": "data_eng", "weight": 0.9},
    "flink":    {"category": "data_eng", "weight": 0.9},

    # ── Practices ─────────────────────────────────────────────────────────────
    "git":              {"category": "practice", "weight": 0.8},
    "microservices":    {"category": "practice", "weight": 1.0},
    "agile":            {"category": "practice", "weight": 0.8},
    "scrum":            {"category": "practice", "weight": 0.8},
    "tdd":              {"category": "practice", "weight": 0.9},
    "devops":           {"category": "practice", "weight": 1.0},

    # ── ORMs / Tools ──────────────────────────────────────────────────────────
    "prisma":       {"category": "tool", "weight": 0.9},
    "sequelize":    {"category": "tool", "weight": 0.9},
    "typeorm":      {"category": "tool", "weight": 0.9},
    "celery":       {"category": "tool", "weight": 0.9},
    "rabbitmq":     {"category": "tool", "weight": 0.9},
    "jwt":          {"category": "tool", "weight": 0.9},
    "oauth":        {"category": "tool", "weight": 0.9},

    # ── Testing ───────────────────────────────────────────────────────────────
    "jest":     {"category": "testing", "weight": 0.9},
    "pytest":   {"category": "testing", "weight": 0.9},
    "cypress":  {"category": "testing", "weight": 0.9},

    # ── Mobile ────────────────────────────────────────────────────────────────
    "react native":     {"category": "mobile", "weight": 1.0},
    "flutter":          {"category": "mobile", "weight": 1.0},
    "android":          {"category": "mobile", "weight": 0.9},
    "ios":              {"category": "mobile", "weight": 0.9},

    # ── BI / Analytics ────────────────────────────────────────────────────────
    "tableau":      {"category": "analytics", "weight": 0.9},
    "power bi":     {"category": "analytics", "weight": 0.9},
    "looker":       {"category": "analytics", "weight": 0.9},
}

# ═════════════════════════════════════════════════════════════════════════════
# 2.  CANONICAL ALIAS MAP  (surface → canonical)
# ═════════════════════════════════════════════════════════════════════════════

ALIAS_MAP: dict[str, str] = {
    # React
    "reactjs": "react",   "react.js": "react",   "react js": "react",

    # Node
    "nodejs": "node.js",  "node": "node.js",      "node js": "node.js",

    # Next
    "nextjs": "next.js",  "next js": "next.js",   "next.js": "next.js",

    # Vue / Nuxt
    "vue.js": "vue",      "vuejs": "vue",
    "nuxt.js": "nuxt",    "nuxtjs": "nuxt",

    # Angular / Svelte
    "angularjs": "angular",

    # Redux
    "redux toolkit": "redux toolkit",   # already canonical multi-word
    "rtk": "redux toolkit",

    # REST
    "rest": "rest api",   "restful": "rest api",  "restful api": "rest api",
    "rest apis": "rest api", "restful apis": "rest api",

    # Express
    "express.js": "express",    "expressjs": "express",

    # CSS guard — solo "css" is fine, but "tailwind css" → tailwind
    "tailwindcss": "tailwind",   "tailwind css": "tailwind",

    # FastAPI
    "fast api": "fastapi",

    # Databases
    "postgres": "postgresql",   "pg": "postgresql",
    "mongo": "mongodb",         "elastic": "elasticsearch",
    "dynamo": "dynamodb",       "dynamo db": "dynamodb",

    # ML / AI
    "sklearn": "scikit-learn",   "scikit learn": "scikit-learn",
    "sk-learn": "scikit-learn",
    "tf": "tensorflow",
    "hf": "huggingface",         "hugging face": "huggingface",
    "bert": "transformers",      "gpt": "llm",
    "gpt-4": "openai api",       "gpt4": "openai api",
    "openai": "openai api",      "open ai": "openai api",
    "chatgpt": "openai api",     "chatgpt api": "openai api",
    "vector db": "vector databases",
    "vector database": "vector databases",
    "retrieval augmented generation": "rag",
    "retrieval-augmented generation": "rag",
    "natural language processing": "nlp",
    "large language model": "llm",
    "large language models": "llm",
    "llms": "llm",
    "finetuning": "fine-tuning",  "fine tuning": "fine-tuning",
    "ml": "machine learning",     "ai": "artificial intelligence",
    "dl": "deep learning",
    "data pre-processing": "data preprocessing",
    "langchain framework": "langchain",

    # Cloud
    "amazon web services": "aws",
    "google cloud": "gcp",          "google cloud platform": "gcp",
    "microsoft azure": "azure",
    "k8s": "kubernetes",            "kube": "kubernetes",
    "gke": "kubernetes",            "eks": "kubernetes",
    "aks": "kubernetes",
    "github-actions": "github actions",
    "gitlab-ci": "gitlab ci",

    # DevOps / CI-CD
    "ci cd": "ci/cd",               "cicd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
    "continuous delivery": "ci/cd",

    # Practices
    "tdd": "tdd",
    "test driven": "tdd",           "test-driven development": "tdd",
    "devops": "devops",             "dev ops": "devops",

    # Tools
    "socket io": "socket.io",       "socketio": "socket.io",
    "websockets": "websocket",      "web socket": "websocket",
    "stripe api": "stripe",         "stripe payments": "stripe",
    "rabbitmq": "rabbitmq",
    "power-bi": "power bi",         "powerbi": "power bi",

    # Mobile
    "rn": "react native",

    # Misc
    "c#": "c#",  "csharp": "c#",
    "c++": "c++", "cpp": "c++",
    "golang": "go",
    "js": "javascript",             "ts": "typescript",
    "apache spark": "spark",        "apache kafka": "kafka",
    "apache airflow": "airflow",
}

# ═════════════════════════════════════════════════════════════════════════════
# 3.  FALSE-POSITIVE BLOCKLIST
#     كلمات ممكن تتطابق مع skills لكن هي مجرد كلام عام
# ═════════════════════════════════════════════════════════════════════════════

BLOCKLIST: frozenset[str] = frozenset({
    "rest", "go", "r", "ai", "ml", "dl", "ts", "js",   # too-short / ambiguous
    "spring", "rails",                                   # بيتلتبس مع كلام عادي
    "express yourself", "express interest",
    "scala", "rust",                                     # ممكن تيجي في كلام عادي
})

# Context guard: الكلمات دي تتقبل بس لو في نفس جملتها context تقني
CONTEXT_REQUIRED: dict[str, list[str]] = {
    "r":    ["programming", "language", "statistical", "rstudio", "cran"],
    "go":   ["programming", "language", "golang", "backend", "microservice"],
    "rust": ["programming", "language", "memory", "systems"],
    "ai":   ["model", "integration", "powered", "machine", "deep", "learning"],
    "ml":   ["model", "pipeline", "training", "inference", "feature"],
}

# ═════════════════════════════════════════════════════════════════════════════
# 4.  SEMANTIC SKILL PHRASES  (context → canonical)
# ═════════════════════════════════════════════════════════════════════════════

SEMANTIC_SKILLS: dict[str, list[str]] = {
    "stripe": [
        "payment integration", "payment gateway", "payment processing",
        "online payments", "billing system", "subscription payments",
        "checkout integration", "payment api",
    ],
    "redux toolkit": [
        "state management", "global state", "application state",
        "centralized store", "flux pattern",
    ],
    "openai api": [
        "openai integration", "chatgpt integration", "llm integration",
        "gpt model", "ai text generation", "language model api",
        "ai api integration",
    ],
    "rabbitmq": [
        "message broker", "message queue", "event driven architecture",
        "async messaging", "pub sub system", "message passing",
    ],
    "celery": [
        "task queue", "background jobs", "async tasks",
        "scheduled tasks", "worker queue", "job queue python",
    ],
    "websocket": [
        "real-time communication", "live updates", "bidirectional communication",
        "real time features", "chat system", "live notifications",
        "real-time data",
    ],
    "jest": [
        "unit testing javascript", "javascript testing",
        "frontend testing", "component testing react",
    ],
    "pytest": [
        "python unit testing", "python testing",
        "test automation python", "backend testing",
    ],
    "langchain": [
        "llm orchestration", "ai pipeline", "retrieval augmented generation",
        "rag system", "ai agent", "llm application", "chaining llm",
    ],
    "vector databases": [
        "vector storage", "vector search", "semantic search infrastructure",
        "embeddings storage", "similarity search", "ann search",
    ],
    "kubernetes": [
        "container orchestration", "cluster management",
        "microservices deployment", "pod scaling", "k8s cluster",
    ],
    "terraform": [
        "infrastructure as code", "cloud provisioning",
        "iac", "infrastructure automation", "cloud resources",
    ],
    "elasticsearch": [
        "full text search", "search engine", "log analytics",
        "document search", "search infrastructure",
    ],
    "kafka": [
        "event streaming", "data pipeline streaming", "real time data processing",
        "stream processing", "event bus",
    ],
    "machine learning": [
        "ml models", "predictive models", "model training",
        "supervised learning", "unsupervised learning",
        "classification algorithms", "regression models",
    ],
    "data preprocessing": [
        "data cleaning", "feature engineering", "data transformation",
        "data normalization", "data wrangling", "data pipeline",
    ],
    "rag": [
        "retrieval augmented generation", "document retrieval",
        "knowledge base qa", "context injection llm",
    ],
    "fine-tuning": [
        "model fine-tuning", "transfer learning", "domain adaptation",
        "custom model training", "llm fine-tuning",
    ],
}

# ═════════════════════════════════════════════════════════════════════════════
# 5.  SKILL RESULT DATACLASS
# ═════════════════════════════════════════════════════════════════════════════

@dataclass
class SkillResult:
    canonical:   str
    confidence:  float
    source:      str           # regex | phrase | semantic | alias
    category:    str  = ""
    raw_mention: str  = ""

    def to_dict(self) -> dict:
        return {
            "canonical":   self.canonical,
            "confidence":  round(self.confidence, 3),
            "source":      self.source,
            "category":    self.category,
            "raw_mention": self.raw_mention,
        }


# ═════════════════════════════════════════════════════════════════════════════
# 6.  PRE-PROCESSING
# ═════════════════════════════════════════════════════════════════════════════

def preprocess(text: str) -> str:
    """Clean + normalise text for matching."""
    t = str(text).lower()
    # protect special skill names before stripping punctuation
    t = t.replace("c#", "csharp").replace("c++", "cpp")
    t = t.replace("ci/cd", "cicd").replace("ci cd", "cicd")
    t = t.replace("node.js", "nodejs").replace("next.js", "nextjs")
    t = t.replace("vue.js", "vuejs").replace("nuxt.js", "nuxtjs")
    t = t.replace("react.js", "reactjs").replace("express.js", "expressjs")
    t = t.replace("socket.io", "socketio")
    # separators → space
    t = re.sub(r"[/\\|@#]", " ", t)
    # collapse whitespace
    t = re.sub(r"\s+", " ", t).strip()
    return t


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"[.\n،;]", text) if s.strip()]


# ═════════════════════════════════════════════════════════════════════════════
# 7.  REGEX LAYER
# ═════════════════════════════════════════════════════════════════════════════

def _build_regex_patterns() -> list[tuple[re.Pattern, str, float]]:
    """
    Build (pattern, canonical, base_confidence).
    Multi-word patterns first (longest match wins).
    """
    patterns: list[tuple[re.Pattern, str, float]] = []
    registered: set[str] = set()

    # Gather all surface → canonical pairs
    all_terms: dict[str, str] = {}
    for canonical in TECH_SKILLS:
        all_terms[canonical] = canonical
    for alias, canonical in ALIAS_MAP.items():
        all_terms[alias] = canonical

    for surface, canonical in sorted(
        all_terms.items(), key=lambda x: len(x[0]), reverse=True
    ):
        norm = preprocess(surface)
        if norm in registered:
            continue

        # Base confidence: exact canonical = 0.97, alias = 0.90
        base_conf = 0.97 if surface == canonical else 0.90

        escaped = re.escape(norm)
        # allow flexible spacing for multi-word
        escaped = re.sub(r"\\ ", r"[\\s\\-]+", escaped)
        try:
            pat = re.compile(
                r"(?<![a-z0-9])" + escaped + r"(?![a-z0-9])",
                re.IGNORECASE,
            )
        except re.error:
            continue

        patterns.append((pat, canonical, base_conf))
        registered.add(norm)

    return patterns


_REGEX_PATTERNS: list[tuple[re.Pattern, str, float]] = _build_regex_patterns()


def regex_layer(text: str) -> list[SkillResult]:
    norm = preprocess(text)
    results: list[SkillResult] = []
    seen: set[str] = set()

    for pat, canonical, base_conf in _REGEX_PATTERNS:
        if canonical in seen:
            continue
        m = pat.search(norm)
        if m:
            # location boost: title-level (short text) → higher confidence
            loc_boost = 0.02 if len(text) < 120 else 0.0
            conf = min(0.99, base_conf + loc_boost)

            info = TECH_SKILLS.get(canonical, {})
            results.append(SkillResult(
                canonical=canonical,
                confidence=conf,
                source="regex",
                category=info.get("category", ""),
                raw_mention=m.group(0),
            ))
            seen.add(canonical)

    return results


# ═════════════════════════════════════════════════════════════════════════════
# 8.  SPACY PHRASE MATCHER LAYER
# ═════════════════════════════════════════════════════════════════════════════

try:
    import spacy
    from spacy.matcher import PhraseMatcher

    _NLP = spacy.load("en_core_web_sm", disable=["ner", "parser"])

    _PHRASE_MATCHER = PhraseMatcher(_NLP.vocab, attr="LOWER")
    _PHRASE_TO_CANONICAL: dict[str, str] = {}

    for canonical in TECH_SKILLS:
        key = f"SKILL_{canonical.upper().replace(' ', '_')}"
        patterns_doc = [_NLP.make_doc(canonical)]
        _PHRASE_MATCHER.add(key, patterns_doc)
        _PHRASE_TO_CANONICAL[key] = canonical

    for alias, canonical in ALIAS_MAP.items():
        key = f"ALIAS_{alias.upper().replace(' ', '_')}"
        patterns_doc = [_NLP.make_doc(alias)]
        _PHRASE_MATCHER.add(key, patterns_doc)
        _PHRASE_TO_CANONICAL[key] = canonical

    _SPACY_AVAILABLE = True
    log.info("✅ spaCy PhraseMatcher loaded")

except Exception as _e:
    _NLP = None
    _PHRASE_MATCHER = None
    _PHRASE_TO_CANONICAL = {}
    _SPACY_AVAILABLE = False
    log.warning(f"spaCy unavailable: {_e}")


def phrase_layer(text: str) -> list[SkillResult]:
    if not _SPACY_AVAILABLE:
        return []

    doc = _NLP(text[:8000])
    matches = _PHRASE_MATCHER(doc)
    results: list[SkillResult] = []
    seen: set[str] = set()

    for match_id, start, end in matches:
        key = _NLP.vocab.strings[match_id]
        canonical = _PHRASE_TO_CANONICAL.get(key)
        if not canonical or canonical in seen:
            continue

        raw = doc[start:end].text
        is_alias = key.startswith("ALIAS_")
        conf = 0.95 if not is_alias else 0.88
        # location boost for title
        if len(text) < 120:
            conf = min(0.99, conf + 0.02)

        info = TECH_SKILLS.get(canonical, {})
        results.append(SkillResult(
            canonical=canonical,
            confidence=conf,
            source="phrase",
            category=info.get("category", ""),
            raw_mention=raw,
        ))
        seen.add(canonical)

    return results


# ═════════════════════════════════════════════════════════════════════════════
# 9.  SEMANTIC SBERT LAYER
# ═════════════════════════════════════════════════════════════════════════════

def _load_sbert(model_name: str = "all-MiniLM-L6-v2"):
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer(model_name)
    except Exception as e:
        log.warning(f"SBERT unavailable: {e}")
        return None


class SemanticLayer:
    """
    Sentence-level semantic similarity using SBERT.
    Phrase embeddings are pre-computed once at init.
    """

    def __init__(
        self,
        sbert_model=None,
        threshold: float = 0.60,
    ):
        self._sbert    = sbert_model or _load_sbert()
        self.threshold = threshold
        self._phrase_embs: dict[str, np.ndarray] = {}

        if self._sbert:
            self._precompute_phrase_embeddings()
            log.info("✅ SemanticLayer: phrase embeddings ready")

    def _precompute_phrase_embeddings(self):
        for skill, phrases in SEMANTIC_SKILLS.items():
            self._phrase_embs[skill] = self._sbert.encode(
                phrases, normalize_embeddings=True
            )

    def available(self) -> bool:
        return self._sbert is not None and bool(self._phrase_embs)

    def extract(self, text: str) -> list[SkillResult]:
        if not self.available():
            return []

        sentences = split_sentences(text)
        if not sentences:
            return []

        sent_embs = self._sbert.encode(
            sentences, normalize_embeddings=True
        )  # (S, D)

        results: list[SkillResult] = []
        for skill, phrase_embs in self._phrase_embs.items():
            sims = phrase_embs @ sent_embs.T      # (P, S)
            max_sim = float(sims.max())
            if max_sim >= self.threshold:
                # confidence = similarity score, capped at 0.93
                conf = min(0.93, max_sim)
                info = TECH_SKILLS.get(skill, {})
                results.append(SkillResult(
                    canonical=skill,
                    confidence=conf,
                    source="semantic",
                    category=info.get("category", ""),
                    raw_mention=f"semantic:{max_sim:.2f}",
                ))

        return results

    def extract_batch(
        self, texts: list[str]
    ) -> list[list[SkillResult]]:
        """Batch semantic extraction — 3× faster than per-text."""
        if not self.available():
            return [[] for _ in texts]

        # flatten all sentences
        all_sents:   list[str] = []
        text_ranges: list[tuple[int, int]] = []

        for text in texts:
            sents = split_sentences(text)
            start = len(all_sents)
            all_sents.extend(sents)
            text_ranges.append((start, len(all_sents)))

        if not all_sents:
            return [[] for _ in texts]

        all_embs = self._sbert.encode(
            all_sents, normalize_embeddings=True, batch_size=64
        )

        output: list[list[SkillResult]] = []
        for start, end in text_ranges:
            sent_embs = all_embs[start:end]
            if len(sent_embs) == 0:
                output.append([])
                continue
            results: list[SkillResult] = []
            for skill, phrase_embs in self._phrase_embs.items():
                sims     = phrase_embs @ sent_embs.T
                max_sim  = float(sims.max())
                if max_sim >= self.threshold:
                    conf = min(0.93, max_sim)
                    info = TECH_SKILLS.get(skill, {})
                    results.append(SkillResult(
                        canonical=skill,
                        confidence=conf,
                        source="semantic",
                        category=info.get("category", ""),
                        raw_mention=f"semantic:{max_sim:.2f}",
                    ))
            output.append(results)

        return output


# ═════════════════════════════════════════════════════════════════════════════
# 10.  CONFIDENCE SCORING  &  DEDUPLICATION
# ═════════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# SUBORDINATE SKILLS
# لو الـ parent موجود في النتايج، نحذف الـ child عشان نتجنب الـ FP
# مثال: tailwind موجود → نحذف css  |  react native موجود → نحذف react
# ─────────────────────────────────────────────────────────────────────────────
SUBORDINATE_SKILLS: dict[str, str] = {
    # child        : parent (لو الـ parent موجود، احذف الـ child)
    "css":          "tailwind",
    "react":        "react native",
    "redux":        "redux toolkit",
    # node.js مش subordinate لـ express — اليوزر ممكن يحتاجهم مع بعض
}

_SOURCE_WEIGHT = {
    "phrase":   1.00,
    "regex":    0.97,
    "semantic": 0.90,
    "alias":    0.88,
}

def _context_ok(skill: str, text: str) -> bool:
    """Return False if skill needs context keywords but none found."""
    required = CONTEXT_REQUIRED.get(skill)
    if not required:
        return True
    text_lower = text.lower()
    return any(kw in text_lower for kw in required)


def merge_and_score(
    results: list[SkillResult],
    text: str,
    title: str = "",
) -> list[SkillResult]:
    """
    Merge duplicates, boost by:
      - source weight
      - title presence (+0.04)
      - skill taxonomy weight
      - frequency (multiple sources found same skill)
    Filter by context guard and blocklist.
    """
    # Group by canonical
    grouped: dict[str, list[SkillResult]] = {}
    for r in results:
        grouped.setdefault(r.canonical, []).append(r)

    merged: list[SkillResult] = []
    title_lower = title.lower()

    for canonical, hits in grouped.items():
        # blocklist guard
        if canonical in BLOCKLIST:
            continue

        # context guard
        if not _context_ok(canonical, text + " " + title):
            log.debug(f"[context_guard] rejected: {canonical}")
            continue

        # best confidence across sources
        base_conf = max(h.confidence for h in hits)

        # frequency boost — each extra source adds 0.01
        freq_boost = min(0.03, (len(hits) - 1) * 0.01)

        # title boost
        title_boost = 0.04 if canonical in title_lower else 0.0

        # taxonomy weight
        tax_weight  = TECH_SKILLS.get(canonical, {}).get("weight", 1.0)

        final_conf  = min(0.99, (base_conf + freq_boost + title_boost) * tax_weight)

        best_hit    = max(hits, key=lambda h: h.confidence)
        best_hit.confidence = final_conf

        merged.append(best_hit)

    # ── Subordinate suppression ───────────────────────────────────────────
    # لو الـ parent موجود في الـ merged، نحذف الـ child
    found_canonicals = {r.canonical for r in merged}
    final: list[SkillResult] = []
    for r in merged:
        parent = SUBORDINATE_SKILLS.get(r.canonical)
        if parent and parent in found_canonicals:
            log.debug(f"[subordinate] suppressed {r.canonical!r} (parent={parent!r})")
            continue
        final.append(r)

    final.sort(key=lambda r: -r.confidence)
    return final


# ═════════════════════════════════════════════════════════════════════════════
# 11.  MAIN EXTRACTOR CLASS
# ═════════════════════════════════════════════════════════════════════════════

class HybridSkillExtractor:
    """
    Production-grade 7-layer skill extractor.

    Parameters
    ----------
    use_spacy        : enable spaCy PhraseMatcher layer
    use_semantic     : enable SBERT semantic layer
    sbert_model      : pass existing SentenceTransformer to avoid double-load
    semantic_threshold: cosine threshold for semantic matches (default 0.60)
    fallback         : returned when nothing found
    """

    def __init__(
        self,
        use_spacy:           bool  = True,
        use_semantic:        bool  = True,
        sbert_model               = None,
        semantic_threshold:  float = 0.60,
        fallback:            str   = "general",
    ):
        self.fallback         = fallback
        self.use_spacy        = use_spacy and _SPACY_AVAILABLE
        self._semantic        = SemanticLayer(
            sbert_model=sbert_model,
            threshold=semantic_threshold,
        ) if use_semantic else None

        log.info(
            f"HybridSkillExtractor ready | "
            f"spaCy={self.use_spacy} | "
            f"semantic={self._semantic.available() if self._semantic else False}"
        )

    # ── Public: single text ───────────────────────────────────────────────────

    def extract(self, text: str | float | None, title: str = "") -> str:
        """
        Returns comma-separated canonical skills (sorted).
        Compatible with the old API.
        """
        results = self.extract_detailed(text, title=title)
        if not results:
            return self.fallback
        return ",".join(r.canonical for r in results)

    def extract_detailed(
        self,
        text: str | float | None,
        title: str = "",
    ) -> list[SkillResult]:
        """
        Full extraction with confidence scores.
        Returns list[SkillResult] sorted by confidence DESC.
        """
        if not text or (isinstance(text, float) and pd.isna(text)):
            return []

        text = str(text)
        t0   = time.perf_counter()

        raw: list[SkillResult] = []

        # L1 — spaCy PhraseMatcher
        if self.use_spacy:
            raw.extend(phrase_layer(text))

        # L2 — Regex
        raw.extend(regex_layer(text))

        # L3 — Semantic
        if self._semantic:
            raw.extend(self._semantic.extract(text))

        # L4-L6 — Merge, score, dedup, filter
        merged = merge_and_score(raw, text, title=title)

        elapsed = (time.perf_counter() - t0) * 1000
        log.debug(
            f"[extract] found={len(merged)} | "
            f"raw={len(raw)} | {elapsed:.1f}ms | "
            f"skills={[r.canonical for r in merged[:5]]}"
        )

        return merged

    # ── Public: pandas Series ─────────────────────────────────────────────────

    def extract_series(self, series: pd.Series) -> pd.Series:
        """
        Vectorised extraction — batches SBERT calls.
        Returns Series of comma-separated skill strings.
        """
        texts = [
            str(t) if t and not (isinstance(t, float) and pd.isna(t)) else ""
            for t in series
        ]

        # Regex + phrase per text (fast, no batching needed)
        regex_phrase_results: list[list[SkillResult]] = []
        for text in texts:
            r: list[SkillResult] = []
            if text:
                if self.use_spacy:
                    r.extend(phrase_layer(text))
                r.extend(regex_layer(text))
            regex_phrase_results.append(r)

        # Semantic batch
        semantic_results: list[list[SkillResult]] = []
        if self._semantic and self._semantic.available():
            semantic_results = self._semantic.extract_batch(texts)
        else:
            semantic_results = [[] for _ in texts]

        # Merge
        output: list[str] = []
        for i, text in enumerate(texts):
            if not text:
                output.append(self.fallback)
                continue
            combined = regex_phrase_results[i] + semantic_results[i]
            merged   = merge_and_score(combined, text)
            output.append(
                ",".join(r.canonical for r in merged) if merged else self.fallback
            )

        return pd.Series(output, index=series.index)


# ═════════════════════════════════════════════════════════════════════════════
# 12.  BACKWARDS-COMPATIBLE DROP-IN
# ═════════════════════════════════════════════════════════════════════════════

_DEFAULT_EXTRACTOR = HybridSkillExtractor(use_spacy=False, use_semantic=False)


def extract_skills_from_text(text) -> str:
    return _DEFAULT_EXTRACTOR.extract(text)


# ═════════════════════════════════════════════════════════════════════════════
# 13.  TEST SUITE
# ═════════════════════════════════════════════════════════════════════════════

TEST_CASES: list[dict] = [
    {
        "category": "Frontend",
        "title": "Senior React Developer",
        "description": (
            "We need a React.js developer with Next.js, TypeScript, Redux Toolkit, "
            "Tailwind CSS, and Webpack experience. You will build reusable components "
            "and manage global state with Redux."
        ),
        "expected": {"react", "next.js", "typescript", "redux toolkit", "tailwind", "webpack"},
    },
    {
        "category": "Backend",
        "title": "Node.js Backend Engineer",
        "description": (
            "Build scalable REST APIs using Node.js and Express. You should know "
            "PostgreSQL, MongoDB, Redis caching, JWT authentication, and Docker. "
            "Experience with payment integration via Stripe is a plus."
        ),
        "expected": {"node.js", "express", "rest api", "postgresql", "mongodb",
                     "redis", "jwt", "docker", "stripe"},
    },
    {
        "category": "AI/ML",
        "title": "ML Engineer — LLM & RAG",
        "description": (
            "Work on LLM fine-tuning, retrieval augmented generation (RAG), "
            "prompt engineering, and vector databases. Use LangChain, OpenAI API, "
            "HuggingFace transformers, PyTorch, and Python. Build data preprocessing "
            "pipelines and NLP models."
        ),
        "expected": {"llm", "rag", "fine-tuning", "prompt engineering", "vector databases",
                     "langchain", "openai api", "huggingface", "transformers",
                     "pytorch", "python", "data preprocessing", "nlp"},
    },
    {
        "category": "DevOps",
        "title": "DevOps Engineer — Kubernetes & AWS",
        "description": (
            "Manage Kubernetes clusters on AWS EKS. Build CI/CD pipelines with "
            "GitHub Actions, write Terraform for infrastructure as code, and use "
            "Docker for containerization. Monitor with Elasticsearch and set up Kafka "
            "for event streaming."
        ),
        "expected": {"kubernetes", "aws", "ci/cd", "github actions", "terraform",
                     "docker", "elasticsearch", "kafka"},
    },
    {
        "category": "Mobile",
        "title": "React Native Developer",
        "description": (
            "Develop cross-platform mobile applications using React Native, TypeScript, "
            "and Redux. Integrate REST APIs, handle real-time features with WebSocket, "
            "and write Jest tests."
        ),
        "expected": {"react native", "typescript", "redux", "rest api", "websocket", "jest"},
    },
    {
        "category": "Context (implicit)",
        "title": "Full Stack Engineer",
        "description": (
            "You will handle payment gateway integration for our e-commerce platform, "
            "manage message queues for async processing, and implement real-time "
            "notifications for users."
        ),
        "expected": {"stripe", "rabbitmq", "websocket"},   # semantic only
    },
]


def run_tests(extractor: Optional[HybridSkillExtractor] = None) -> dict:
    """
    Run all test cases and return a precision/recall report.
    """
    ext = extractor or HybridSkillExtractor(use_spacy=False, use_semantic=False)

    print("\n" + "═" * 70)
    print("  SKILL EXTRACTOR TEST REPORT")
    print("═" * 70)

    total_tp = total_fp = total_fn = 0

    category_results: list[dict] = []

    for tc in TEST_CASES:
        text      = f"{tc['title']} {tc['description']}"
        expected  = tc["expected"]
        extracted = set(ext.extract(text).split(","))
        extracted.discard("general")

        tp = expected & extracted
        fp = extracted - expected
        fn = expected - extracted

        precision = len(tp) / len(extracted) if extracted else 0.0
        recall    = len(tp) / len(expected)  if expected  else 0.0
        f1        = (
            2 * precision * recall / (precision + recall)
            if precision + recall > 0 else 0.0
        )

        total_tp += len(tp)
        total_fp += len(fp)
        total_fn += len(fn)

        print(f"\n[{tc['category']}] {tc['title']}")
        print(f"  ✅ TP ({len(tp)}): {sorted(tp)}")
        print(f"  ❌ FP ({len(fp)}): {sorted(fp)}")
        print(f"  ⚠️  FN ({len(fn)}): {sorted(fn)}")
        print(f"  P={precision:.0%}  R={recall:.0%}  F1={f1:.0%}")

        category_results.append({
            "category": tc["category"],
            "precision": precision,
            "recall":    recall,
            "f1":        f1,
            "tp": len(tp), "fp": len(fp), "fn": len(fn),
        })

    # Overall
    overall_p = total_tp / (total_tp + total_fp) if (total_tp + total_fp) else 0
    overall_r = total_tp / (total_tp + total_fn) if (total_tp + total_fn) else 0
    overall_f1 = (
        2 * overall_p * overall_r / (overall_p + overall_r)
        if (overall_p + overall_r) else 0
    )

    print("\n" + "─" * 70)
    print(f"  OVERALL  P={overall_p:.0%}  R={overall_r:.0%}  F1={overall_f1:.0%}")
    print(f"  TP={total_tp}  FP={total_fp}  FN={total_fn}")
    print("═" * 70 + "\n")

    return {
        "overall": {"precision": overall_p, "recall": overall_r, "f1": overall_f1},
        "by_category": category_results,
        "tp": total_tp, "fp": total_fp, "fn": total_fn,
    }


# ═════════════════════════════════════════════════════════════════════════════
# 14.  CLI
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Hybrid Skill Extractor v4")
    parser.add_argument("--test",      action="store_true", help="Run test suite")
    parser.add_argument("--text",      type=str,            help="Extract from text")
    parser.add_argument("--no-spacy",  action="store_true")
    parser.add_argument("--no-semantic", action="store_true")
    args = parser.parse_args()

    ext = HybridSkillExtractor(
        use_spacy=not args.no_spacy,
        use_semantic=not args.no_semantic,
    )

    if args.test:
        run_tests(ext)

    if args.text:
        results = ext.extract_detailed(args.text)
        print(json.dumps([r.to_dict() for r in results], indent=2, ensure_ascii=False))
# patch applied below in _build_regex_patterns via SUBORDINATE_SKILLS