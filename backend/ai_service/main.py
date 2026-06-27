"""
main.py — AI Job Recommender FastAPI Service (v4.2 Spacy-First)
Optimized with spaCy-only skill extraction, absolute score normalization,
and cached Hybrid Skill Extraction pipeline.
"""

import os
import json
import time
import logging
import subprocess
import sys
import math
from contextlib import asynccontextmanager
from typing import Optional
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import faiss
import lightgbm as lgb
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# ─── Local imports ──────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)
sys.path.insert(0, BASE)

from services.skill_normalizer import SkillNormalizer
from services.feature_builder import FeatureBuilder, FEATURES
from services.ranking_service import RankingService
from services.feedback_service import FeedbackService
from utils.validators import validate_feature_schema, validate_model_meta
from skill_extractor import HybridSkillExtractor, SpacySkillExtractor

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ai_service")

# ─── Paths ──────────────────────────────────────────────────────────────────
MODELS = Path(BASE) / "models"
DATA = Path(BASE) / "data"
FEEDBACK_LOG = DATA / "feedback_log.jsonl"

# ─── State ──────────────────────────────────────────────────────────────────
STATE: dict = {}

INTERNAL_TOKEN = os.environ.get("INTERNAL_API_TOKEN", "")


def verify_token(request: Request):
    if not INTERNAL_TOKEN:
        return
    token = request.headers.get("x-internal-token", "")
    if token != INTERNAL_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ─── Pydantic Models ────────────────────────────────────────────────────────
class UserPayload(BaseModel):
    userId: int
    title: str = ""
    learningPathTitle: str = ""
    progressPercent: float = 0.0
    skills: list[str] = []
    declaredSkills: list[str] = []
    experienceYears: float = 0.0


class JobPayload(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    jobType: Optional[str] = None
    learningPathId: Optional[int] = None
    learningPathTitle: Optional[str] = None
    experienceLevel: Optional[str] = None
    applyLink: Optional[str] = None
    postedAt: Optional[str] = None
    source: Optional[str] = None
    skills: list[str] = []


class RecommendRequest(BaseModel):
    user: UserPayload
    jobs: list[JobPayload]
    topN: int = 5


class ExtractSkillsRequest(BaseModel):
    title: str
    description: str = ""


class BatchExtractItem(BaseModel):
    id: int
    title: str
    description: str = ""


# ─── Lifespan ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Loading AI models & Pipelines...")

    meta_path = MODELS / "model_meta.json"
    if not meta_path.exists():
        raise FileNotFoundError(f"model_meta.json not found at {meta_path}. Run retrain.py first.")

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    try:
        validate_model_meta(meta, FEATURES)
    except Exception as e:
        log.warning(f"model_meta validation warning: {e}")

    STATE["ranker"] = lgb.Booster(model_file=str(MODELS / "lambdamart_model.txt"))
    STATE["meta"] = meta
    STATE["features"] = FEATURES
    STATE["index"] = faiss.read_index(str(DATA / "jobs.index"))
    STATE["index"].nprobe = 20
    STATE["jobs_df"] = pd.read_parquet(str(DATA / "jobs.parquet"))

    # ── 1. spaCy-Only Extractor (FAST — للـ /extract-skills endpoint) ──────
    STATE["spacy_extractor"] = SpacySkillExtractor()

    # ── 2. Normalizer + Feature Builder (shared) ───────────────────────────
    STATE["normalizer"] = SkillNormalizer()
    STATE["feature_builder"] = FeatureBuilder(normalizer=STATE["normalizer"])

    # ── 3. SBERT + Hybrid Extractor (SLOW — للـ recommendation pipeline) ─────
    STATE["sbert"] = SentenceTransformer("all-MiniLM-L6-v2")
    STATE["skill_extractor"] = HybridSkillExtractor(sbert_model=STATE["sbert"])

    STATE["feedback"] = FeedbackService(FEEDBACK_LOG)

    log.info(f"Loaded Successfully — {STATE['index'].ntotal:,} jobs | {len(FEATURES)} features")
    yield
    log.info("Shutting down AI service.")


app = FastAPI(title="AI Job Recommender", version="4.2", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _build_user_text(user: UserPayload, normalizer: SkillNormalizer) -> str:
    """Build semantic search text from user profile."""
    u_skills = normalizer.parse(user.skills or [])
    u_skills |= normalizer.parse(user.declaredSkills or [])
    u_skills_txt = ", ".join(u_skills) or "general"
    u_exp = user.experienceYears or 0
    lvl = "senior" if u_exp >= 7 else ("mid level" if u_exp >= 3 else "entry level")
    return f"{user.learningPathTitle} {user.title} {lvl} developer {u_skills_txt}"


def _build_match_details(user_skills_set: set, job: JobPayload, feats: dict, normalizer: SkillNormalizer) -> dict:
    """Build frontend-facing match details with smooth raw feature exposure."""
    j_skills = normalizer.parse(job.skills or [])

    matched = sorted(user_skills_set & j_skills)
    missing = sorted(j_skills - user_skills_set)
    gap_pct = round(len(missing) / len(j_skills) * 100) if j_skills else 0

    explanation = []
    if matched:
        explanation.append(
            f"You already know {len(matched)} required skill{'s' if len(matched) > 1 else ''}: "
            f"{', '.join(matched[:3])}{'…' if len(matched) > 3 else ''}"
        )
    if missing:
        explanation.append(
            f"Learning {', '.join(missing[:3])} will make you a strong candidate"
        )

    def _f(key):
        v = feats.get(key)
        return round(v, 3) if v is not None and not (isinstance(v, float) and (v != v)) else None

    if _f("freshness") and _f("freshness") >= 0.9:
        explanation.append("This is a very recent job posting")
    if _f("lp_alignment") and _f("lp_alignment") >= 0.5:
        explanation.append("This job aligns well with your learning path")
    if _f("exp_match") and _f("exp_match") == 1.0:
        explanation.append("Your experience level matches the job requirements")
    elif _f("exp_match") and _f("exp_match") == 0.5:
        explanation.append("Your experience level is close to the job requirements")
    if _f("career_alignment") and _f("career_alignment") >= 0.5:
        explanation.append("Your current skills already cover a good portion of this job's requirements")
    if not explanation:
        explanation.append("Selected based on your learning path and profile")

    return {
        "skillOverlap": _f("skill_overlap"),
        "expMatch": _f("exp_match"),
        "freshness": _f("freshness"),
        "careerFit": _f("career_alignment"),
        "learningGap": _f("learning_gap_score"),
        "lpAlignment": _f("lp_alignment"),
        "userSkillDensity": _f("user_skill_density"),
        "jobSkillDifficulty": _f("job_skill_difficulty"),
        "matchedSkills": matched,
        "missingSkills": missing,
        "skillGapPct": gap_pct,
        "features": {
            "skillOverlap": _f("skill_overlap"),
            "freshness": _f("freshness"),
            "lpAlignment": _f("lp_alignment"),
            "careerFit": _f("career_alignment"),
            "readiness": round(max(0.0, 1.0 - (_f("learning_gap_score") or 0)), 3) if _f("learning_gap_score") is not None else None,
            "userSkillDensity": _f("user_skill_density"),
            "jobSkillDifficulty": _f("job_skill_difficulty"),
        },
        "explanation": explanation,
    }


# ─── Routes ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    spacy_ready = False
    spacy_ext = STATE.get("spacy_extractor")
    if spacy_ext:
        spacy_ready = spacy_ext.ready
    return {
        "status": "ok",
        "jobs_indexed": STATE["index"].ntotal if "index" in STATE else 0,
        "model": "lambdamart_v4.2_spacy",
        "features": FEATURES,
        "n_features": len(FEATURES),
        "spacy_ready": spacy_ready,
    }


@app.post("/recommend", dependencies=[Depends(verify_token)])
def recommend(req: RecommendRequest):
    t0 = time.time()
    ranker = STATE["ranker"]
    index = STATE["index"]
    sbert = STATE["sbert"]
    normalizer = STATE["normalizer"]
    builder = STATE["feature_builder"]
    jobs_df = STATE["jobs_df"]
    user = req.user

    if not req.jobs:
        return {"recommendations": [], "meta": {"reason": "no_jobs"}}

    jobs_map = {j.id: j for j in req.jobs}

    # تجهيز مهارات المستخدم كـ Set موحدة في البداية لتجنب تكرار العمليات داخل الـ Loops
    u_skills = normalizer.parse(user.skills or [])
    u_skills |= normalizer.parse(user.declaredSkills or [])

    # ── FAISS retrieval ──────────────────────────────────────────────────────
    u_text = _build_user_text(user, normalizer)
    u_emb = sbert.encode([u_text], normalize_embeddings=True).astype("float32")
    dist, idx = index.search(u_emb, min(200, index.ntotal))
    payload_ids = {str(jid) for jid in jobs_map.keys()}

    candidates = []
    found_ids = set()

    for rank in range(len(idx[0])):
        ji = int(idx[0][rank])
        if ji >= len(jobs_df):
            continue
        db_job = jobs_df.iloc[ji]
        job_id_s = str(db_job.get("job_id", ""))
        if job_id_s not in payload_ids:
            continue
        job_id_i = int(db_job["job_id"])
        if job_id_i not in jobs_map:
            continue

        job = jobs_map[job_id_i]
        retrieval_score = float(np.exp(-dist[0][rank]))
        feats = builder.build(user, job, retrieval_score, jobs_df)
        candidates.append({"job": job, "features": feats})
        found_ids.add(job_id_i)

    for jid, job in jobs_map.items():
        if jid not in found_ids:
            feats = builder.build(user, job, None, jobs_df)
            candidates.append({"job": job, "features": feats})

    if not candidates:
        return {"recommendations": [], "meta": {"reason": "no_candidates"}}

    # ── Validate feature schema ──────────────────────────────────────────────
    feat_df = pd.DataFrame([c["features"] for c in candidates])
    try:
        validate_feature_schema(feat_df, FEATURES)
    except Exception as e:
        log.error(f"Feature validation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Feature validation: {e}")

    # ── Rank with MMR diversity ──────────────────────────────────────────────
    ranking_svc = RankingService(ranker, FEATURES, normalizer)
    ranked = ranking_svc.rank(candidates, top_n=req.topN, lambda_param=0.7)

    # ── Score Normalization — absolute mapping, no batch compression ─────────
    recommendations = []
    for idx, item in enumerate(ranked):
        job = item["candidate"]["job"]
        feats = item["candidate"]["features"]
        match_detail = _build_match_details(u_skills, job, feats, normalizer)

        recommendations.append({
            "rank": item["rank"],
            "jobId": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "jobType": job.jobType,
            "experienceLevel": job.experienceLevel,
            "applyLink": job.applyLink,
            "postedAt": job.postedAt,
            "source": job.source,
            "score": RankingService.normalize_score(item["raw_score"]),
            "rawScore": round(item["raw_score"], 4),
            "matchDetails": match_detail,
        })

    elapsed = round((time.time() - t0) * 1000, 1)
    log.info(
        f"Recommend user={user.userId} | skills={len(u_skills)} | "
        f"candidates={len(candidates)} | topN={req.topN} | {elapsed}ms"
    )

    return {
        "recommendations": recommendations,
        "meta": {
            "userId": user.userId,
            "totalCandidates": len(candidates),
            "elapsedMs": elapsed,
            "skillsUsed": len(u_skills),
            "userSkills": list(u_skills),
            "features": FEATURES,
        },
    }


# ─── spaCy-Only Skill Extraction Endpoint ───────────────────────────────────

@app.post("/extract-skills", dependencies=[Depends(verify_token)])
def extract_skills(req: ExtractSkillsRequest):
    """
    spaCy-Only Skill Extraction.
    Uses PhraseMatcher as the primary (and only) layer — no regex, no semantic, no SBERT.
    """
    spacy_ext = STATE.get("spacy_extractor")
    if not spacy_ext or not spacy_ext.ready:
        raise HTTPException(status_code=503, detail="spaCy extraction engine not ready")

    try:
        detailed_skills = spacy_ext.extract(req.title, req.description)
        return {"skills": [skill.to_dict() for skill in detailed_skills]}
    except Exception as e:
        log.error(f"Skill extraction failure: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction pipeline error: {str(e)}")


@app.post("/batch-extract-skills", dependencies=[Depends(verify_token)])
def batch_extract_skills(jobs: list[BatchExtractItem]):
    """
    High-performance batch processing for scraped jobs utilizing the cached extractor state.
    """
    spacy_ext = STATE.get("spacy_extractor")
    if not spacy_ext or not spacy_ext.ready:
        raise HTTPException(status_code=503, detail="spaCy extraction engine not ready")

    results = []
    try:
        for job in jobs:
            detailed_skills = spacy_ext.extract(job.title, job.description)
            results.append({
                "jobId": job.id,
                "skills": [skill.to_dict() for skill in detailed_skills]
            })

        return {"results": results}
    except Exception as e:
        log.error(f"Batch skill extraction crashed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch processing engine error: {str(e)}")


# ─── Feedback & Retrain ──────────────────────────────────────────────────────

@app.post("/feedback", dependencies=[Depends(verify_token)])
def feedback(event: dict):
    required = {"userId", "jobId", "action"}
    if not required.issubset(event.keys()):
        raise HTTPException(status_code=400, detail=f"Missing fields: {required - event.keys()}")

    svc = STATE.get("feedback")
    if not svc:
        raise HTTPException(status_code=503, detail="Feedback service not ready")
    svc.append(event)
    return {"status": "received"}


@app.get("/feedback/stats", dependencies=[Depends(verify_token)])
def feedback_stats():
    svc = STATE.get("feedback")
    if not svc:
        raise HTTPException(status_code=503, detail="Feedback service not ready")
    return svc.stats()


@app.post("/retrain", dependencies=[Depends(verify_token)])
def trigger_retrain():
    svc = STATE.get("feedback")
    if not svc:
        raise HTTPException(status_code=503, detail="Feedback service not ready")

    stats = svc.stats()
    if stats["total"] < 50:
        raise HTTPException(
            status_code=400,
            detail=f"Need at least 50 feedback events. Got: {stats['total']}",
        )

    proc = subprocess.Popen(
        [sys.executable, "retrain.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log.info(f"Retrain started — PID={proc.pid} | events={stats['total']}")
    return {"status": "started", "pid": proc.pid, "feedback_events": stats["total"]}


@app.get("/ping")
def ping():
    svc = STATE.get("feedback")
    feedback_count = svc.stats()["total"] if svc else 0
    spacy_ready = False
    spacy_ext = STATE.get("spacy_extractor")
    if spacy_ext:
        spacy_ready = spacy_ext.ready
    return {
        "status": "ok",
        "ranker": "loaded" if "ranker" in STATE else "missing",
        "index": STATE["index"].ntotal if "index" in STATE else 0,
        "sbert": "loaded" if "sbert" in STATE else "missing",
        "spacy_extractor": "ready" if spacy_ready else "not_ready",
        "feedback_count": feedback_count,
        "features": FEATURES,
        "n_features": len(FEATURES),
    }


# ════════════════════════════════════════════════════════════════════════════
# DEBUG ENDPOINT: Inspect raw scoring for every job in payload (no FAISS)
# ════════════════════════════════════════════════════════════════════════════
@app.post("/debug-rank")
def debug_rank(req: RecommendRequest):
    """
    Return raw features + scores for every job in the payload.
    Does NOT use FAISS — useful for debugging feature computation.
    """
    ranker = STATE["ranker"]
    normalizer = STATE["normalizer"]
    builder = STATE["feature_builder"]
    jobs_df = STATE["jobs_df"]
    user = req.user

    u_skills = normalizer.parse(user.skills or [])
    u_skills |= normalizer.parse(user.declaredSkills or [])

    if not req.jobs:
        return {
            "userId": user.userId,
            "totalScored": 0,
            "top10": [],
            "scoreStats": {"min": 0, "max": 0, "avg": 0, "median": 0},
            "note": "No jobs in payload",
        }

    raw_scores = []
    calculated_feats = []

    for job in req.jobs:
        feats = builder.build(user, job, None, jobs_df)
        calculated_feats.append((job, feats))

        feat_df = pd.DataFrame([feats])
        for col in FEATURES:
            if col not in feat_df.columns:
                feat_df[col] = np.nan
        feat_df = feat_df[FEATURES]

        raw_score = float(ranker.predict(feat_df)[0])
        raw_scores.append(raw_score)

    # Absolute normalization — no batch compression
    normalized_scores = [
        RankingService.normalize_score(score)
        for score in raw_scores
    ]

    debug_rows = []
    for idx, (job, feats) in enumerate(calculated_feats):
        j_skills = normalizer.parse(job.skills or [])

        debug_rows.append({
            "jobId": job.id,
            "title": job.title,
            "company": job.company,
            "rawScore": round(raw_scores[idx], 4),
            "normalizedScore": normalized_scores[idx],
            "features": {k: round(v, 4) if v is not None and not (isinstance(v, float) and (v != v)) else None
                        for k, v in feats.items()},
            "userSkills": list(u_skills),
            "jobSkills": list(j_skills),
            "matchedSkills": list(u_skills & j_skills),
            "missingSkills": list(j_skills - u_skills),
        })

    debug_rows.sort(key=lambda x: x["rawScore"], reverse=True)
    scores = [r["normalizedScore"] for r in debug_rows]

    return {
        "userId": user.userId,
        "userSkills": list(u_skills),
        "totalScored": len(debug_rows),
        "top10": debug_rows[:10],
        "scoreStats": {
            "min": min(scores) if scores else 0,
            "max": max(scores) if scores else 0,
            "avg": round(sum(scores) / len(scores), 1) if scores else 0,
            "median": round(sorted(scores)[len(scores) // 2], 1) if scores else 0,
        },
        "ranking": [
            {"rank": i + 1, "jobId": r["jobId"], "title": r["title"], "score": r["normalizedScore"]}
            for i, r in enumerate(debug_rows[:10])
        ],
    }