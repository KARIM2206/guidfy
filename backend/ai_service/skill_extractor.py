"""
skill_extractor.py — Production-Grade Hybrid Skill Extraction System
==================================================================

SpaCy-First Version: /extract-skills endpoint uses ONLY spaCy PhraseMatcher.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import time
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Optional, Union

# ─────────────────────────────────────────────────────────────────────────────
# Optional dependencies — graceful degradation
# ─────────────────────────────────────────────────────────────────────────────
try:
    import numpy as np
except ImportError:
    np = None

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    import spacy
    from spacy.matcher import PhraseMatcher
except ImportError:
    spacy = None
    PhraseMatcher = None

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
# 1. CANONICAL SKILL TAXONOMY
# ═════════════════════════════════════════════════════════════════════════════

TECH_SKILLS: dict[str, dict] = {
    # ── Languages ────────────────────────────────────────────────────────────
    "python": {"category": "language", "weight": 1.0},
    "javascript": {"category": "language", "weight": 1.0},
    "typescript": {"category": "language", "weight": 1.0},
    "java": {"category": "language", "weight": 1.0},
    "c#": {"category": "language", "weight": 1.0},
    "c++": {"category": "language", "weight": 1.0},
    "go": {"category": "language", "weight": 1.0},
    "rust": {"category": "language", "weight": 1.0},
    "php": {"category": "language", "weight": 1.0},
    "ruby": {"category": "language", "weight": 1.0},
    "swift": {"category": "language", "weight": 1.0},
    "kotlin": {"category": "language", "weight": 1.0},
    "scala": {"category": "language", "weight": 1.0},
    "dart": {"category": "language", "weight": 1.0},
    "r": {"category": "language", "weight": 0.8},
    "matlab": {"category": "language", "weight": 0.9},
    "elixir": {"category": "language", "weight": 0.9},

    # ── Front-end ────────────────────────────────────────────────────────────
    "react": {"category": "frontend", "weight": 1.0},
    "vue": {"category": "frontend", "weight": 1.0},
    "angular": {"category": "frontend", "weight": 1.0},
    "svelte": {"category": "frontend", "weight": 0.9},
    "next.js": {"category": "frontend", "weight": 1.0},
    "nuxt": {"category": "frontend", "weight": 0.9},
    "html": {"category": "frontend", "weight": 0.8},
    "css": {"category": "frontend", "weight": 0.8},
    "tailwind": {"category": "frontend", "weight": 1.0},
    "bootstrap": {"category": "frontend", "weight": 0.9},
    "webpack": {"category": "frontend", "weight": 0.9},
    "vite": {"category": "frontend", "weight": 0.9},
    "redux": {"category": "frontend", "weight": 1.0},
    "redux toolkit": {"category": "frontend", "weight": 1.0},

    # ── Back-end ───────────────────────────────────────────────────────────────
    "node.js": {"category": "backend", "weight": 1.0},
    "express": {"category": "backend", "weight": 1.0},
    "django": {"category": "backend", "weight": 1.0},
    "flask": {"category": "backend", "weight": 1.0},
    "fastapi": {"category": "backend", "weight": 1.0},
    "spring": {"category": "backend", "weight": 1.0},
    "laravel": {"category": "backend", "weight": 1.0},
    "rails": {"category": "backend", "weight": 1.0},
    "graphql": {"category": "backend", "weight": 1.0},
    "rest api": {"category": "backend", "weight": 1.0},
    "grpc": {"category": "backend", "weight": 0.9},
    "socket.io": {"category": "backend", "weight": 0.9},
    "websocket": {"category": "backend", "weight": 0.9},
    "stripe": {"category": "backend", "weight": 1.0},

    # ── Databases ────────────────────────────────────────────────────────────
    "postgresql": {"category": "database", "weight": 1.0},
    "mysql": {"category": "database", "weight": 1.0},
    "mongodb": {"category": "database", "weight": 1.0},
    "redis": {"category": "database", "weight": 1.0},
    "elasticsearch": {"category": "database", "weight": 1.0},
    "sqlite": {"category": "database", "weight": 0.8},
    "cassandra": {"category": "database", "weight": 0.9},
    "dynamodb": {"category": "database", "weight": 0.9},
    "neo4j": {"category": "database", "weight": 0.9},
    "snowflake": {"category": "database", "weight": 0.9},
    "bigquery": {"category": "database", "weight": 0.9},
    "redshift": {"category": "database", "weight": 0.9},
    "databricks": {"category": "database", "weight": 0.9},
    "sql": {"category": "database", "weight": 0.9},

    # ── AI / ML ───────────────────────────────────────────────────────────────
    "machine learning": {"category": "ai_ml", "weight": 1.0},
    "deep learning": {"category": "ai_ml", "weight": 1.0},
    "nlp": {"category": "ai_ml", "weight": 1.0},
    "llm": {"category": "ai_ml", "weight": 1.0},
    "prompt engineering": {"category": "ai_ml", "weight": 1.0},
    "rag": {"category": "ai_ml", "weight": 1.0},
    "fine-tuning": {"category": "ai_ml", "weight": 1.0},
    "embeddings": {"category": "ai_ml", "weight": 1.0},
    "vector databases": {"category": "ai_ml", "weight": 1.0},
    "tensorflow": {"category": "ai_ml", "weight": 1.0},
    "pytorch": {"category": "ai_ml", "weight": 1.0},
    "keras": {"category": "ai_ml", "weight": 1.0},
    "scikit-learn": {"category": "ai_ml", "weight": 1.0},
    "xgboost": {"category": "ai_ml", "weight": 0.9},
    "lightgbm": {"category": "ai_ml", "weight": 0.9},
    "huggingface": {"category": "ai_ml", "weight": 1.0},
    "transformers": {"category": "ai_ml", "weight": 1.0},
    "openai api": {"category": "ai_ml", "weight": 1.0},
    "langchain": {"category": "ai_ml", "weight": 1.0},
    "pinecone": {"category": "ai_ml", "weight": 1.0},
    "weaviate": {"category": "ai_ml", "weight": 0.9},
    "chromadb": {"category": "ai_ml", "weight": 0.9},
    "mlflow": {"category": "ai_ml", "weight": 0.9},
    "pandas": {"category": "ai_ml", "weight": 0.9},
    "numpy": {"category": "ai_ml", "weight": 0.9},
    "data preprocessing": {"category": "ai_ml", "weight": 1.0},
    "artificial intelligence": {"category": "ai_ml", "weight": 1.0},

    # ── Cloud / DevOps ───────────────────────────────────────────────────────
    "aws": {"category": "devops", "weight": 1.0},
    "azure": {"category": "devops", "weight": 1.0},
    "gcp": {"category": "devops", "weight": 1.0},
    "docker": {"category": "devops", "weight": 1.0},
    "kubernetes": {"category": "devops", "weight": 1.0},
    "terraform": {"category": "devops", "weight": 1.0},
    "ansible": {"category": "devops", "weight": 0.9},
    "helm": {"category": "devops", "weight": 0.9},
    "ci/cd": {"category": "devops", "weight": 1.0},
    "jenkins": {"category": "devops", "weight": 0.9},
    "github actions": {"category": "devops", "weight": 1.0},
    "gitlab ci": {"category": "devops", "weight": 0.9},
    "linux": {"category": "devops", "weight": 0.9},
    "bash": {"category": "devops", "weight": 0.9},
    "nginx": {"category": "devops", "weight": 0.9},

    # ── Data Engineering ─────────────────────────────────────────────────────
    "spark": {"category": "data_eng", "weight": 1.0},
    "kafka": {"category": "data_eng", "weight": 1.0},
    "airflow": {"category": "data_eng", "weight": 1.0},
    "dbt": {"category": "data_eng", "weight": 0.9},
    "flink": {"category": "data_eng", "weight": 0.9},

    # ── Practices ────────────────────────────────────────────────────────────
    "git": {"category": "practice", "weight": 0.8},
    "microservices": {"category": "practice", "weight": 1.0},
    "agile": {"category": "practice", "weight": 0.8},
    "scrum": {"category": "practice", "weight": 0.8},
    "tdd": {"category": "practice", "weight": 0.9},
    "devops": {"category": "practice", "weight": 1.0},

    # ── ORMs / Tools ─────────────────────────────────────────────────────────
    "prisma": {"category": "tool", "weight": 0.9},
    "sequelize": {"category": "tool", "weight": 0.9},
    "typeorm": {"category": "tool", "weight": 0.9},
    "celery": {"category": "tool", "weight": 0.9},
    "rabbitmq": {"category": "tool", "weight": 0.9},
    "jwt": {"category": "tool", "weight": 0.9},
    "oauth": {"category": "tool", "weight": 0.9},

    # ── Testing ──────────────────────────────────────────────────────────────
    "jest": {"category": "testing", "weight": 0.9},
    "pytest": {"category": "testing", "weight": 0.9},
    "cypress": {"category": "testing", "weight": 0.9},

    # ── Mobile ───────────────────────────────────────────────────────────────
    "react native": {"category": "mobile", "weight": 1.0},
    "flutter": {"category": "mobile", "weight": 1.0},
    "android": {"category": "mobile", "weight": 0.9},
    "ios": {"category": "mobile", "weight": 0.9},

    # ── BI / Analytics ─────────────────────────────────────────────────────
    "tableau": {"category": "analytics", "weight": 0.9},
    "power bi": {"category": "analytics", "weight": 0.9},
    "looker": {"category": "analytics", "weight": 0.9},
}


# ═════════════════════════════════════════════════════════════════════════════
# 2. CANONICAL ALIAS MAP  (surface → canonical)
# ═════════════════════════════════════════════════════════════════════════════

ALIAS_MAP: dict[str, str] = {
    # React
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    # Node
    "nodejs": "node.js",
    "node": "node.js",
    "node js": "node.js",
    # Next
    "nextjs": "next.js",
    "next js": "next.js",
    # Vue / Nuxt
    "vue.js": "vue",
    "vuejs": "vue",
    "nuxt.js": "nuxt",
    "nuxtjs": "nuxt",
    # Angular / Svelte
    "angularjs": "angular",
    # Redux
    "rtk": "redux toolkit",
    # REST
    "rest": "rest api",
    "restful": "rest api",
    "restful api": "rest api",
    "rest apis": "rest api",
    "restful apis": "rest api",
    # Express
    "express.js": "express",
    "expressjs": "express",
    # CSS
    "tailwindcss": "tailwind",
    "tailwind css": "tailwind",
    # FastAPI
    "fast api": "fastapi",
    # Databases
    "postgres": "postgresql",
    "pg": "postgresql",
    "mongo": "mongodb",
    "elastic": "elasticsearch",
    "dynamo": "dynamodb",
    "dynamo db": "dynamodb",
    # ML / AI
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "sk-learn": "scikit-learn",
    "tf": "tensorflow",
    "hf": "huggingface",
    "hugging face": "huggingface",
    "bert": "transformers",
    "gpt": "llm",
    "gpt-4": "openai api",
    "gpt4": "openai api",
    "openai": "openai api",
    "open ai": "openai api",
    "chatgpt": "openai api",
    "chatgpt api": "openai api",
    "vector db": "vector databases",
    "vector database": "vector databases",
    "retrieval augmented generation": "rag",
    "retrieval-augmented generation": "rag",
    "natural language processing": "nlp",
    "large language model": "llm",
    "large language models": "llm",
    "llms": "llm",
    "finetuning": "fine-tuning",
    "fine tuning": "fine-tuning",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "dl": "deep learning",
    "data pre-processing": "data preprocessing",
    "langchain framework": "langchain",
    # Cloud
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "microsoft azure": "azure",
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "gke": "kubernetes",
    "eks": "kubernetes",
    "aks": "kubernetes",
    "github-actions": "github actions",
    "gitlab-ci": "gitlab ci",
    # DevOps / CI-CD
    "ci cd": "ci/cd",
    "cicd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
    "continuous delivery": "ci/cd",
    # Practices
    "test driven": "tdd",
    "test-driven development": "tdd",
    "dev ops": "devops",
    # Tools
    "socket io": "socket.io",
    "socketio": "socket.io",
    "websockets": "websocket",
    "web socket": "websocket",
    "stripe api": "stripe",
    "stripe payments": "stripe",
    "power-bi": "power bi",
    "powerbi": "power bi",
    # Mobile
    "rn": "react native",
    # Misc
    "csharp": "c#",
    "cpp": "c++",
    "golang": "go",
    "js": "javascript",
    "ts": "typescript",
    "apache spark": "spark",
    "apache kafka": "kafka",
    "apache airflow": "airflow",
}


# ═════════════════════════════════════════════════════════════════════════════
# 3. FALSE-POSITIVE BLOCKLIST & CONTEXT GUARDS
# ═════════════════════════════════════════════════════════════════════════════

BLOCKLIST: frozenset[str] = frozenset({
    "go",
    "r",
    "ai",
    "ml",
    "dl",
    "rest",
})

CONTEXT_REQUIRED: dict[str, list[str]] = {
    "go": ["programming", "language", "golang", "backend", "microservice"],
    "r": ["programming", "language", "statistical", "rstudio", "cran", "statistics"],
    "ai": ["model", "integration", "powered", "machine", "deep", "learning", "artificial"],
    "ml": ["model", "pipeline", "training", "inference", "feature", "machine"],
    "dl": ["learning", "neural", "network", "deep"],
    "rest": ["api", "web", "service", "endpoint", "http"],
}


# ═════════════════════════════════════════════════════════════════════════════
# 4. SEMANTIC SKILL PHRASES  (MUST be before SemanticLayer class)
# ═════════════════════════════════════════════════════════════════════════════

SEMANTIC_SKILLS: dict[str, list[str]] = {
    "stripe": [
        "payment integration",
        "payment gateway",
        "payment processing",
        "online payments",
        "billing system",
        "subscription payments",
        "checkout integration",
        "payment api",
    ],
    "redux toolkit": [
        "state management",
        "global state",
        "application state",
        "centralized store",
        "flux pattern",
    ],
    "openai api": [
        "openai integration",
        "chatgpt integration",
        "llm integration",
        "gpt model",
        "ai text generation",
        "language model api",
        "ai api integration",
    ],
    "rabbitmq": [
        "message broker",
        "message queue",
        "event driven architecture",
        "async messaging",
        "pub sub system",
        "message passing",
    ],
    "celery": [
        "task queue",
        "background jobs",
        "async tasks",
        "scheduled tasks",
        "worker queue",
        "job queue python",
    ],
    "websocket": [
        "real-time communication",
        "live updates",
        "bidirectional communication",
        "real time features",
        "chat system",
        "live notifications",
        "real-time data",
    ],
    "jest": [
        "unit testing javascript",
        "javascript testing",
        "frontend testing",
        "component testing react",
    ],
    "pytest": [
        "python unit testing",
        "python testing",
        "test automation python",
        "backend testing",
    ],
    "langchain": [
        "llm orchestration",
        "ai pipeline",
        "retrieval augmented generation",
        "rag system",
        "ai agent",
        "llm application",
        "chaining llm",
    ],
    "vector databases": [
        "vector storage",
        "vector search",
        "semantic search infrastructure",
        "embeddings storage",
        "similarity search",
        "ann search",
    ],
    "kubernetes": [
        "container orchestration",
        "cluster management",
        "microservices deployment",
        "pod scaling",
        "k8s cluster",
    ],
    "terraform": [
        "infrastructure as code",
        "cloud provisioning",
        "iac",
        "infrastructure automation",
        "cloud resources",
    ],
    "elasticsearch": [
        "full text search",
        "search engine",
        "log analytics",
        "document search",
        "search infrastructure",
    ],
    "kafka": [
        "event streaming",
        "data pipeline streaming",
        "real time data processing",
        "stream processing",
        "event bus",
    ],
    "machine learning": [
        "ml models",
        "predictive models",
        "model training",
        "supervised learning",
        "unsupervised learning",
        "classification algorithms",
        "regression models",
    ],
    "data preprocessing": [
        "data cleaning",
        "feature engineering",
        "data transformation",
        "data normalization",
        "data wrangling",
        "data pipeline",
    ],
    "rag": [
        "retrieval augmented generation",
        "document retrieval",
        "knowledge base qa",
        "context injection llm",
    ],
    "fine-tuning": [
        "model fine-tuning",
        "transfer learning",
        "domain adaptation",
        "custom model training",
        "llm fine-tuning",
    ],
}


# ═════════════════════════════════════════════════════════════════════════════
# 5. SUBORDINATE SKILLS  (child → parent)
# ═════════════════════════════════════════════════════════════════════════════

SUBORDINATE_SKILLS: dict[str, str] = {
    "css": "tailwind",
    "react": "react native",
    "redux": "redux toolkit",
}


# ═════════════════════════════════════════════════════════════════════════════
# 6. SOURCE WEIGHTS
# ═════════════════════════════════════════════════════════════════════════════

_SOURCE_WEIGHTS: dict[str, float] = {
    "phrase": 1.00,
    "regex": 0.97,
    "semantic": 0.90,
    "alias": 0.88,
}


# ═════════════════════════════════════════════════════════════════════════════
# 7. SKILL RESULT DATACLASS
# ═════════════════════════════════════════════════════════════════════════════

@dataclass
class SkillResult:
    canonical: str
    confidence: float
    source: str
    category: str = ""
    raw_mention: str = ""

    def to_dict(self) -> dict:
        return {
            "canonical": self.canonical,
            "confidence": round(self.confidence, 3),
            "source": self.source,
            "category": self.category,
            "raw_mention": self.raw_mention,
        }


# ═════════════════════════════════════════════════════════════════════════════
# 8. UTILITY FUNCTIONS
# ═════════════════════════════════════════════════════════════════════════════

def _is_nan(val: Any) -> bool:
    if val is None:
        return True
    try:
        if isinstance(val, float) and val != val:
            return True
    except (TypeError, ValueError):
        pass
    if pd is not None and pd.isna(val):
        return True
    return False


def preprocess(text: str) -> str:
    if not isinstance(text, str):
        text = str(text) if text is not None else ""

    t = text.lower()

    replacements = [
        ("c++", "cplusplus"),
        ("c#", "csharp"),
        ("ci/cd", "cicd"),
        ("node.js", "nodejs"),
        ("next.js", "nextjs"),
        ("react.js", "reactjs"),
        ("vue.js", "vuejs"),
        ("nuxt.js", "nuxtjs"),
        ("express.js", "expressjs"),
        ("socket.io", "socketio"),
    ]

    for old, new in replacements:
        t = t.replace(old, new)

    t = re.sub(r"[/\\|@#]", " ", t)
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()

    return t


def split_sentences(text: str) -> list[str]:
    if not text:
        return []
    sentences = re.split(r"(?<=[.!?،;])\s+|\n+", text)
    return [s.strip() for s in sentences if s.strip()]


def _make_safe_key(name: str) -> str:
    key = name.lower()
    key = key.replace("+", "plus")
    key = key.replace("#", "sharp")
    key = key.replace("/", "")
    key = key.replace(".", "")
    key = key.replace(" ", "_")
    key = key.replace("-", "_")
    return key


# ═════════════════════════════════════════════════════════════════════════════
# 9. SPACY PHRASE MATCHER LAYER  (PRIMARY — no regex, no semantic)
# ═════════════════════════════════════════════════════════════════════════════

_NLP: Optional[Any] = None
_PHRASE_MATCHER: Optional[Any] = None
_PHRASE_TO_CANONICAL: dict[str, str] = {}
_SPACY_INITIALIZED: bool = False


def initialize_spacy() -> bool:
    global _NLP, _PHRASE_MATCHER, _PHRASE_TO_CANONICAL, _SPACY_INITIALIZED

    if _SPACY_INITIALIZED:
        return True

    if spacy is None or PhraseMatcher is None:
        log.warning("spaCy not installed — PhraseMatcher layer disabled")
        return False

    try:
        try:
            _NLP = spacy.load(
                "en_core_web_sm",
                disable=["parser", "ner", "lemmatizer"],
            )
        except Exception:
            log.warning(
                "spaCy model 'en_core_web_sm' missing — "
                "falling back to blank English model"
            )
            _NLP = spacy.blank("en")

        _PHRASE_MATCHER = PhraseMatcher(_NLP.vocab, attr="LOWER")

        all_terms: dict[str, str] = {}
        for canonical in TECH_SKILLS:
            all_terms[canonical] = canonical
        for alias, canonical in ALIAS_MAP.items():
            all_terms[alias] = canonical

        for surface, canonical in all_terms.items():
            norm = preprocess(surface)
            if not norm:
                continue

            is_alias = surface != canonical
            prefix = "ALIAS_" if is_alias else "SKILL_"
            safe_key = prefix + _make_safe_key(surface)

            doc = _NLP.make_doc(norm)
            _PHRASE_MATCHER.add(safe_key, [doc])
            _PHRASE_TO_CANONICAL[safe_key] = canonical

        _SPACY_INITIALIZED = True
        log.info(
            f"spaCy initialised successfully "
            f"({len(_PHRASE_TO_CANONICAL)} patterns)"
        )
        return True

    except Exception as e:
        log.warning(f"spaCy initialisation failed: {e}")
        _SPACY_INITIALIZED = False
        return False


def phrase_layer(text: str) -> list[SkillResult]:
    if not _SPACY_INITIALIZED or _NLP is None or _PHRASE_MATCHER is None:
        return []

    MAX_CHARS = 100_000
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS]

    norm = preprocess(text)
    if not norm:
        return []

    try:
        doc = _NLP(norm)
    except Exception as e:
        log.warning(f"spaCy processing failed: {e}")
        return []

    matches = _PHRASE_MATCHER(doc)
    results: list[SkillResult] = []
    seen: set[str] = set()

    for match_id, start, end in matches:
        key = _NLP.vocab.strings[match_id]
        canonical = _PHRASE_TO_CANONICAL.get(key)
        if not canonical or canonical in seen:
            continue

        raw = doc[start:end].text
        source = "alias" if key.startswith("ALIAS_") else "phrase"
        conf = 0.88 if source == "alias" else 0.95

        if len(text) < 120:
            conf = min(0.99, conf + 0.02)

        info = TECH_SKILLS.get(canonical, {})
        results.append(
            SkillResult(
                canonical=canonical,
                confidence=conf,
                source=source,
                category=info.get("category", ""),
                raw_mention=raw,
            )
        )
        seen.add(canonical)

    return results


# ═════════════════════════════════════════════════════════════════════════════
# 10. CONFIDENCE SCORING, DEDUPLICATION & FALSE-POSITIVE FILTERING
# ═════════════════════════════════════════════════════════════════════════════

def _context_ok(skill: str, text: str) -> bool:
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
    if not results:
        return []

    grouped: dict[str, list[SkillResult]] = {}
    for r in results:
        grouped.setdefault(r.canonical, []).append(r)

    merged: list[SkillResult] = []
    title_lower = title.lower()
    text_and_title = (text + " " + title).lower()

    for canonical, hits in grouped.items():
        if canonical in BLOCKLIST and not _context_ok(canonical, text_and_title):
            log.debug(f"[blocklist] rejected: {canonical}")
            continue

        best_hit = max(hits, key=lambda h: h.confidence)
        source_weight = _SOURCE_WEIGHTS.get(best_hit.source, 0.85)
        base_conf = best_hit.confidence * source_weight
        freq_boost = min(0.03, (len(hits) - 1) * 0.01)
        title_boost = 0.04 if canonical in title_lower else 0.0
        tax_weight = TECH_SKILLS.get(canonical, {}).get("weight", 1.0)

        final_conf = min(0.99, (base_conf + freq_boost + title_boost) * tax_weight)
        best_hit.confidence = final_conf
        merged.append(best_hit)

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
# 11. SPACY-ONLY EXTRACTOR  (PRIMARY — للـ /extract-skills endpoint)
# ═════════════════════════════════════════════════════════════════════════════

class SpacySkillExtractor:
    """
    spaCy-only skill extractor for production API endpoints.
    Uses ONLY the spaCy PhraseMatcher layer — no regex, no semantic, no SBERT.
    Fast init, no external model downloads, CPU-only.
    """

    def __init__(self):
        self._initialized = initialize_spacy()
        if not self._initialized:
            log.warning("SpacySkillExtractor: spaCy unavailable — extractor disabled")

    @property
    def ready(self) -> bool:
        return self._initialized

    def extract(self, title: str, description: str = "") -> list[SkillResult]:
        text = f"{title}\n{description}".strip()
        if not text or not self._initialized:
            return []

        raw = phrase_layer(text)
        return merge_and_score(raw, text, title=title)

    def extract_to_dict(self, title: str, description: str = "") -> list[dict]:
        return [r.to_dict() for r in self.extract(title, description)]


# ═════════════════════════════════════════════════════════════════════════════
# 12. SEMANTIC SBERT LAYER  (OPTIONAL — للـ Hybrid بس)
# ═════════════════════════════════════════════════════════════════════════════

class SemanticLayer:
    def __init__(
        self,
        sbert_model: Optional[Any] = None,
        threshold: float = 0.60,
    ):
        self._sbert = sbert_model
        self.threshold = threshold
        self._phrase_embs: dict[str, Any] = {}
        self._available = False

        if np is None:
            log.warning("numpy unavailable — semantic layer disabled")
            return

        if self._sbert is not None:
            self._precompute()
        else:
            self._load_and_precompute()

    def _load_and_precompute(self) -> None:
        try:
            from sentence_transformers import SentenceTransformer
            self._sbert = SentenceTransformer("all-MiniLM-L6-v2")
            self._precompute()
        except Exception as e:
            log.warning(f"SBERT unavailable: {e}")
            self._sbert = None
            self._available = False

    def _precompute(self) -> None:
        if self._sbert is None or np is None:
            return
        try:
            for skill, phrases in SEMANTIC_SKILLS.items():
                if not phrases:
                    continue
                embs = self._sbert.encode(phrases, normalize_embeddings=True)
                self._phrase_embs[skill] = embs
            self._available = True
            log.info(f"SemanticLayer ready with {len(self._phrase_embs)} skill embeddings")
        except Exception as e:
            log.warning(f"Failed to precompute semantic embeddings: {e}")
            self._available = False

    def available(self) -> bool:
        return self._available and self._sbert is not None and bool(self._phrase_embs)

    def extract(self, text: str) -> list[SkillResult]:
        if not self.available():
            return []
        sentences = split_sentences(text)
        if not sentences:
            return []
        try:
            sent_embs = self._sbert.encode(sentences, normalize_embeddings=True)
        except Exception as e:
            log.warning(f"SBERT encoding failed: {e}")
            return []

        results: list[SkillResult] = []
        for skill, phrase_embs in self._phrase_embs.items():
            sims = phrase_embs @ sent_embs.T
            max_sim = float(sims.max())
            if max_sim >= self.threshold:
                conf = min(0.93, max_sim)
                info = TECH_SKILLS.get(skill, {})
                results.append(
                    SkillResult(
                        canonical=skill,
                        confidence=conf,
                        source="semantic",
                        category=info.get("category", ""),
                        raw_mention=f"semantic:{max_sim:.2f}",
                    )
                )
        return results


# ═════════════════════════════════════════════════════════════════════════════
# 13. REGEX LAYER  (FALLBACK — للـ Hybrid بس)
# ═════════════════════════════════════════════════════════════════════════════

@lru_cache(maxsize=1)
def _build_regex_patterns() -> tuple[tuple[re.Pattern, str, str, float], ...]:
    patterns: list[tuple[re.Pattern, str, str, float]] = []
    registered: set[str] = set()

    all_terms: dict[str, tuple[str, str]] = {}
    for canonical in TECH_SKILLS:
        all_terms[canonical] = (canonical, "regex")
    for alias, canonical in ALIAS_MAP.items():
        all_terms[alias] = (canonical, "alias")

    items = sorted(all_terms.items(), key=lambda x: len(x[0]), reverse=True)

    for surface, (canonical, source) in items:
        norm = preprocess(surface)
        if not norm or norm in registered:
            continue

        escaped = re.escape(norm)
        escaped = re.sub(r"\\ ", r"[\\s\\-]+", escaped)

        try:
            pat = re.compile(
                r"(?<![a-z0-9])" + escaped + r"(?![a-z0-9])",
                re.IGNORECASE,
            )
        except re.error:
            continue

        base_conf = 0.97 if source == "regex" else 0.88
        patterns.append((pat, canonical, source, base_conf))
        registered.add(norm)

    return tuple(patterns)


def regex_layer(text: str) -> list[SkillResult]:
    norm = preprocess(text)
    if not norm:
        return []

    results: list[SkillResult] = []
    seen: set[str] = set()

    for pat, canonical, source, base_conf in _build_regex_patterns():
        if canonical in seen:
            continue
        m = pat.search(norm)
        if m:
            loc_boost = 0.02 if len(text) < 120 else 0.0
            conf = min(0.99, base_conf + loc_boost)
            info = TECH_SKILLS.get(canonical, {})
            results.append(
                SkillResult(
                    canonical=canonical,
                    confidence=conf,
                    source=source,
                    category=info.get("category", ""),
                    raw_mention=m.group(0),
                )
            )
            seen.add(canonical)

    return results


# ═════════════════════════════════════════════════════════════════════════════
# 14. HYBRID EXTRACTOR  (للـ recommendation pipeline — يحمل SBERT)
# ═════════════════════════════════════════════════════════════════════════════

class HybridSkillExtractor:
    def __init__(
        self,
        use_spacy: bool = True,
        use_semantic: bool = True,
        sbert_model: Optional[Any] = None,
        semantic_threshold: float = 0.60,
        fallback: str = "general",
    ):
        self.fallback = fallback
        self.use_spacy = use_spacy

        if use_spacy:
            self.use_spacy = initialize_spacy()

        self._semantic: Optional[SemanticLayer] = None
        if use_semantic:
            self._semantic = SemanticLayer(
                sbert_model=sbert_model,
                threshold=semantic_threshold,
            )

        spacy_status = self.use_spacy
        semantic_status = self._semantic.available() if self._semantic else False
        log.info(f"HybridSkillExtractor ready | spaCy={spacy_status} | semantic={semantic_status}")

    def extract(self, text: Union[str, float, None], title: str = "") -> str:
        results = self.extract_detailed(text, title=title)
        if not results:
            return self.fallback
        return ",".join(r.canonical for r in results)

    def extract_detailed(
        self,
        text: Union[str, float, None],
        title: str = "",
    ) -> list[SkillResult]:
        if _is_nan(text) or not text:
            return []

        text = str(text).strip()
        if not text:
            return []

        t0 = time.perf_counter()
        raw: list[SkillResult] = []

        if self.use_spacy:
            try:
                raw.extend(phrase_layer(text))
            except Exception as e:
                log.warning(f"spaCy layer failed: {e}")

        try:
            raw.extend(regex_layer(text))
        except Exception as e:
            log.warning(f"Regex layer failed: {e}")

        if self._semantic:
            try:
                raw.extend(self._semantic.extract(text))
            except Exception as e:
                log.warning(f"Semantic layer failed: {e}")

        merged = merge_and_score(raw, text, title=title)

        elapsed = (time.perf_counter() - t0) * 1000
        log.debug(
            f"[extract] found={len(merged)} | "
            f"raw={len(raw)} | {elapsed:.1f}ms | "
            f"skills={[r.canonical for r in merged[:5]]}"
        )

        return merged


# ═════════════════════════════════════════════════════════════════════════════
# 15. CLI
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="SpaCy-First Skill Extractor — No SBERT loading"
    )
    parser.add_argument(
        "--text", type=str, help="Extract skills from title+description"
    )
    parser.add_argument(
        "--title", type=str, default="", help="Job title"
    )
    parser.add_argument(
        "--description", type=str, default="", help="Job description"
    )
    parser.add_argument(
        "--hybrid", action="store_true", help="Use Hybrid extractor (loads SBERT)"
    )
    args = parser.parse_args()

    if args.hybrid:
        ext = HybridSkillExtractor()
        text = args.text or f"{args.title} {args.description}"
        results = ext.extract_detailed(text, title=args.title)
    else:
        ext = SpacySkillExtractor()
        if not ext.ready:
            print(json.dumps({"error": "spaCy not available"}, indent=2))
            sys.exit(1)
        results = ext.extract(args.title, args.description)

    print(json.dumps([r.to_dict() for r in results], indent=2, ensure_ascii=False))