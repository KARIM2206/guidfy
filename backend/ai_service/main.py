"""
خدمة توصية الوظائف بالذكاء الاصطناعي — FastAPI
المنفذ: 4000
"""

import os
import json
import time
import logging
import subprocess
import sys
from contextlib import asynccontextmanager
from typing import Optional
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import faiss
import joblib
import lightgbm as lgb
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# ─── إضافة مسار الـ extractor ────────────────────────────────────────────────
BASE   = os.path.dirname(__file__)
sys.path.insert(0, BASE)
from skill_extractor import HybridSkillExtractor

# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ai_service")

# ─── المسارات ─────────────────────────────────────────────────────────────────
MODELS       = os.path.join(BASE, "models")
DATA         = os.path.join(BASE, "data")
FEEDBACK_LOG = Path(DATA) / "feedback_log.jsonl"

# ─── الحالة العامة ────────────────────────────────────────────────────────────
STATE: dict = {}

# ─── Skill normalizer — يوحد أسماء المهارات للمقارنة ─────────────────────────
SKILL_ALIASES = {
    "react.js": "react", "reactjs": "react",
    "vue.js": "vue", "vuejs": "vue",
    "node.js": "node", "nodejs": "node",
    "next.js": "nextjs", "next js": "nextjs",
    "ts": "typescript",
    "js": "javascript",
    "css3": "css", "css2": "css",
    "html5": "html", "html/css": "html",
    "postgresql": "postgres",
    "c#": "csharp", "c++": "cpp",
    "dotnet": ".net", "asp.net": ".net",
    "sklearn": "scikit-learn",
    "k8s": "kubernetes",
    "ml": "machine learning",
    "ai": "machine learning",
    "powerbi": "power bi", "power-bi": "power bi",
}

def normalize_skill(skill: str) -> str:
    s = str(skill).lower().strip().replace("®", "").replace("™", "")
    return SKILL_ALIASES.get(s, s)

def parse_skills(raw) -> frozenset:
    """
    يحول أي format لـ frozenset من المهارات المُوحَّدة.
    يتعامل مع: list | comma-string | JSON string | None
    """
    if not raw:
        return frozenset()
    if isinstance(raw, (list, tuple)):
        items = raw
    elif isinstance(raw, str):
        if raw.startswith("["):
            try:
                items = json.loads(raw)
            except Exception:
                items = raw.split(",")
        else:
            items = raw.split(",")
    else:
        return frozenset()
    return frozenset(normalize_skill(s) for s in items if str(s).strip())


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("جاري تحميل نماذج الذكاء الاصطناعي...")

    with open(os.path.join(MODELS, "model_meta.json")) as f:
        meta = json.load(f)

    STATE["ranker"]    = lgb.Booster(model_file=os.path.join(MODELS, "lambdamart_model.txt"))
    STATE["scaler"]    = joblib.load(os.path.join(MODELS, "feature_scaler.pkl"))
    STATE["meta"]      = meta
    STATE["features"]  = meta["features"]
    STATE["scale_f"]   = meta["scale_features"]
    STATE["exp_map"]   = meta["exp_map"]
    STATE["index"]     = faiss.read_index(os.path.join(DATA, "jobs.index"))
    STATE["index"].nprobe = 20
    STATE["jobs_df"]   = pd.read_parquet(os.path.join(DATA, "jobs.parquet"))
    STATE["sbert"]     = SentenceTransformer("all-MiniLM-L6-v2")
    STATE["extractor"] = HybridSkillExtractor(
        use_spacy=False,
        use_semantic=True,
        sbert_model=STATE["sbert"],  # نفس الموديل المحمل
    )
    # ── تحميل HybridSkillExtractor مرة واحدة ─────────────────────────────
    # STATE["extractor"] = HybridSkillExtractor(use_spacy=False)
    log.info("✅ HybridSkillExtractor جاهز")

    log.info(f"✅ تم التحميل — {STATE['index'].ntotal:,} وظيفة في الفهرس")
    yield
    log.info("إيقاف الخدمة.")


app = FastAPI(title="AI Job Recommender", version="3.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

INTERNAL_TOKEN = os.environ.get("INTERNAL_API_TOKEN", "")

def verify_token(request: Request):
    if not INTERNAL_TOKEN:
        return
    token = request.headers.get("x-internal-token", "")
    if token != INTERNAL_TOKEN:
        raise HTTPException(status_code=401, detail="غير مصرح")


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class UserPayload(BaseModel):
    userId:            int
    title:             str           = ""
    learningPathTitle: str           = ""
    progressPercent:   float         = 0.0
    skills:            list[str]     = []
    declaredSkills:    list[str]     = []
    experienceYears:   float         = 0.0

class JobPayload(BaseModel):
    id:                int
    title:             str
    description:       Optional[str] = None
    company:           Optional[str] = None
    location:          Optional[str] = None
    jobType:           Optional[str] = None
    learningPathId:    Optional[int] = None
    learningPathTitle: Optional[str] = None
    experienceLevel:   Optional[str] = None
    applyLink:         Optional[str] = None
    postedAt:          Optional[str] = None
    source:            Optional[str] = None
    skills:            list[str]     = []

class RecommendRequest(BaseModel):
    user: UserPayload
    jobs: list[JobPayload]
    topN: int = 5

class ExtractSkillsRequest(BaseModel):
    title:       str
    description: str  = ""

class BatchExtractItem(BaseModel):
    id:          int
    title:       str
    description: str = ""


# ─── EXP MAP ─────────────────────────────────────────────────────────────────
EXP_MAP = {
    "Entry level": 0, "entry level": 0, "Entry": 0,
    "Associate": 2,
    "Mid-Senior level": 5, "Mid": 3, "mid-senior level": 5,
    "Senior": 7, "Director": 10, "Executive": 15,
}


# ─── استخراج مهارات الوظيفة ───────────────────────────────────────────────────

def get_job_skills(job: JobPayload, extractor: HybridSkillExtractor) -> frozenset:
    """
    يجيب skills الوظيفة بالأولوية:
    1. لو الـ job فيها skills جاهزة → يستخدمها مباشرة
    2. لو مفيش → يستخرجها من description + title بالـ HybridSkillExtractor
    """
    # أولاً: skills الجاهزة
    if job.skills:
        parsed = parse_skills(job.skills)
        if parsed:
            return parsed

    # ثانياً: استخراج من النص بالـ extractor
    text = f"{job.title or ''} {job.description or ''}"
    extracted = extractor.extract(text)
    if extracted and extracted != "general":
        return parse_skills(extracted)

    return frozenset()


def get_user_skills(user: UserPayload, extractor: HybridSkillExtractor) -> frozenset:
    """
    يجمع skills اليوزر من كل المصادر:
    1. skills من الـ progress (جاية من Node.js backend)
    2. declaredSkills اللي أضافها يدوياً
    3. لو مفيش → يستخرج من الـ title بالـ extractor
    """
    all_skills = set()

    # المصدر 1: skills من الـ backend (steps + lessons + LP recommendation)
    for s in user.skills:
        all_skills.add(normalize_skill(s))

    # المصدر 2: declared skills
    for s in user.declaredSkills:
        all_skills.add(normalize_skill(s))

    # المصدر 3: استخرج من title لو مفيش skills
    if not all_skills and user.title:
        extracted = extractor.extract(user.title)
        if extracted and extracted != "general":
            all_skills.update(parse_skills(extracted))

    return frozenset(all_skills)


# ─── حساب الـ Features ────────────────────────────────────────────────────────

def compute_features(
    user: UserPayload,
    job: JobPayload,
    retrieval_score: float,
    jobs_df: pd.DataFrame,
    extractor: HybridSkillExtractor,
) -> dict:
    """
    يحسب الـ 12 feature لزوج (user, job) بنفس المنطق اللي اتدرب عليه الموديل.
    """
    u_skills = get_user_skills(user, extractor)
    j_skills = get_job_skills(job, extractor)
    u_exp    = float(user.experienceYears or 0)

    # 1. Jaccard skill overlap
    union   = u_skills | j_skills
    overlap = len(u_skills & j_skills) / len(union) if union else 0.0

    # 2. Experience match
    j_exp_req = EXP_MAP.get(job.experienceLevel or "", 3)
    exp_match = float(u_exp >= j_exp_req)

    # 3. Freshness
    if job.postedAt:
        try:
            posted  = pd.to_datetime(job.postedAt, utc=True)
            days    = (pd.Timestamp.now(tz="UTC") - posted).days
        except Exception:
            days = 180
    else:
        days = 180
    freshness = float(np.clip(1.0 - days / 180.0, 0, 1))

    # 4. Salary score
    salary_score = float(np.clip(u_exp / 15.0, 0, 1))

    # 5. Career alignment
    u_title_words = set((user.learningPathTitle or user.title or "").lower().split())
    j_title_words = set((job.title or "").lower().split())
    career = (
        len(u_title_words & j_title_words) / len(u_title_words | j_title_words)
        if u_title_words | j_title_words else 0.0
    )

    # 6. User skill density
    density  = min(len(u_skills), 20) / 20.0
    u_density = float(np.clip(density * (0.8 + 0.4 * overlap), 0, 1))

    # 7. Job skill difficulty
    difficulty = min(len(j_skills), 15) / 15.0

    # 8. Learning gap
    gap = float(np.clip(difficulty - overlap, 0, 1))

    # 9. Company popularity
    match       = jobs_df[jobs_df["job_id"].astype(str) == str(job.id)]
    apply_count = float(match["apply_count"].iloc[0]) if len(match) > 0 else 0.0
    popularity  = float(np.log1p(apply_count) / 15.0)

    # 10. Industry similarity
    ind_sim = career * 0.8

    # 11. LP alignment
    lp_align = float(np.clip(1.0 - gap * 1.5 + overlap * 0.5, 0, 1))

    return {
        "retrieval_score":      np.log1p(retrieval_score * 10),
        "skill_overlap":        overlap,
        "exp_match":            exp_match,
        "freshness":            freshness,
        "salary_score":         salary_score,
        "career_alignment":     career,
        "user_skill_density":   u_density,
        "job_skill_difficulty": difficulty,
        "learning_gap_score":   gap,
        "company_popularity":   popularity,
        "industry_similarity":  ind_sim,
        "lp_alignment":         lp_align,
    }


def build_match_details(
    user: UserPayload,
    job: JobPayload,
    feats: dict,
    extractor: HybridSkillExtractor,
) -> dict:
    """
    يبني تفاصيل المطابقة الكاملة للـ frontend:
    matchedSkills, missingSkills, skillGapPct, features, explanation
    """
    u_skills = get_user_skills(user, extractor)
    j_skills = get_job_skills(job, extractor)

    matched = sorted(u_skills & j_skills)
    missing = sorted(j_skills - u_skills)
    gap_pct = round(len(missing) / len(j_skills) * 100) if j_skills else 0

    # جمل تفسيرية للـ UI
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
    if feats["freshness"] >= 0.9:
        explanation.append("This is a very recent job posting")
    if feats["lp_alignment"] >= 0.8:
        explanation.append("This job aligns well with your learning path")
    if feats["exp_match"]:
        explanation.append("Your experience level matches the job requirements")
    if feats["career_alignment"] >= 0.5:
        explanation.append("Your career title is a strong fit for this role")
    if not explanation:
        explanation.append("Selected based on your learning path and profile")

    return {
        "skillOverlap": round(feats["skill_overlap"], 3),
        "expMatch":     bool(feats["exp_match"]),
        "freshness":    round(feats["freshness"], 3),
        "careerFit":    round(feats["career_alignment"], 3),
        "learningGap":  round(feats["learning_gap_score"], 3),
        "lpAlignment":  round(feats["lp_alignment"], 3),
        # ─── للـ UI ──────────────────────────────────────────────────────────
        "matchedSkills": matched,
        "missingSkills": missing,
        "skillGapPct":   gap_pct,
        "features": {
            "skillOverlap": round(feats["skill_overlap"], 3),
            "freshness":    round(feats["freshness"], 3),
            "lpAlignment":  round(feats["lp_alignment"], 3),
            "careerFit":    round(feats["career_alignment"], 3),
            "readiness":    round(max(0.0, 1.0 - feats["learning_gap_score"]), 3),
        },
        "explanation": explanation,
    }


def normalize_score(raw_score: float) -> int:
    """يحول الـ raw score السالب لـ نسبة مئوية 0-100"""
    MIN, MAX = -15.0, 5.0
    clamped = max(MIN, min(MAX, raw_score))
    return round(((clamped - MIN) / (MAX - MIN)) * 100)


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":        "ok",
        "jobs_indexed":  STATE["index"].ntotal if "index" in STATE else 0,
        "model":         "lambdamart_v3",
        "extractor":     "HybridSkillExtractor",
    }


@app.post("/recommend", dependencies=[Depends(verify_token)])
def recommend(req: RecommendRequest):
    t0        = time.time()
    ranker    = STATE["ranker"]
    scaler    = STATE["scaler"]
    features  = STATE["features"]
    scale_f   = STATE["scale_f"]
    index     = STATE["index"]
    sbert     = STATE["sbert"]
    jobs_df   = STATE["jobs_df"]
    extractor = STATE["extractor"]
    user      = req.user

    if not req.jobs:
        return {"recommendations": [], "meta": {"reason": "no_jobs"}}

    jobs_map = {j.id: j for j in req.jobs}

    # ── 1. تشفير المستخدم ──────────────────────────────────────────────────
    u_skills     = get_user_skills(user, extractor)
    u_skills_txt = ", ".join(u_skills) or "general"
    u_exp        = user.experienceYears or 0
    lvl          = "senior" if u_exp >= 7 else ("mid level" if u_exp >= 3 else "entry level")
    u_text       = f"{user.learningPathTitle} {user.title} {lvl} developer {u_skills_txt}"

    u_emb = sbert.encode([u_text], normalize_embeddings=True).astype("float32")

    # ── 2. FAISS retrieval ─────────────────────────────────────────────────
    dist, idx = index.search(u_emb, min(200, index.ntotal))
    payload_ids = {str(jid) for jid in jobs_map.keys()}

    # ── 3. بناء المرشحين ──────────────────────────────────────────────────
    candidates = []

    # أ) من FAISS
    for rank in range(len(idx[0])):
        ji       = int(idx[0][rank])
        if ji >= len(jobs_df):
            continue
        db_job   = jobs_df.iloc[ji]
        job_id_s = str(db_job["job_id"])
        if job_id_s not in payload_ids:
            continue
        job_id_i = int(db_job["job_id"])
        if job_id_i not in jobs_map:
            continue
        job   = jobs_map[job_id_i]
        feats = compute_features(user, job, float(dist[0][rank]), jobs_df, extractor)
        candidates.append({"job": job, "features": feats})

    # ب) الوظائف خارج الـ FAISS index
    found_ids = {c["job"].id for c in candidates}
    for jid, job in jobs_map.items():
        if jid not in found_ids:
            feats = compute_features(user, job, 0.0, jobs_df, extractor)
            candidates.append({"job": job, "features": feats})

    if not candidates:
        return {"recommendations": [], "meta": {"reason": "no_candidates"}}

    # ── 4. تطبيع وتصنيف ───────────────────────────────────────────────────
    feat_df = pd.DataFrame([c["features"] for c in candidates])
    for col in features:
        if col not in feat_df.columns:
            feat_df[col] = 0.0
    feat_df  = feat_df[features].fillna(0).replace([np.inf, -np.inf], 0)
    feat_df[scale_f] = scaler.transform(feat_df[scale_f])
    scores   = ranker.predict(feat_df[features])

    # ── 5. أعلى N نتيجة ───────────────────────────────────────────────────
    top_indices = np.argsort(scores)[::-1][: req.topN]

    recommendations = []
    for rank, idx_ in enumerate(top_indices):
        job          = candidates[idx_]["job"]
        feats        = candidates[idx_]["features"]
        match_detail = build_match_details(user, job, feats, extractor)
        raw_score    = float(scores[idx_])

        recommendations.append({
            "rank":           rank + 1,
            "jobId":          job.id,
            "title":          job.title,
            "company":        job.company,
            "location":       job.location,
            "jobType":        job.jobType,
            "experienceLevel": job.experienceLevel,
            "applyLink":      job.applyLink,
            "postedAt":       job.postedAt,
            "source":         job.source,
            "score":          normalize_score(raw_score),   # 0-100
            "rawScore":       round(raw_score, 4),
            "matchDetails":   match_detail,
        })

    elapsed = round((time.time() - t0) * 1000, 1)
    log.info(
        f"توصية للمستخدم {user.userId} | "
        f"skills={len(u_skills)} | "
        f"candidates={len(candidates)} | "
        f"{elapsed}ms"
    )

    return {
        "recommendations": recommendations,
        "meta": {
            "userId":          user.userId,
            "totalCandidates": len(candidates),
            "elapsedMs":       elapsed,
            "skillsUsed":      len(u_skills),
            "userSkills":      list(u_skills),
        },
    }


@app.post("/extract-skills", dependencies=[Depends(verify_token)])
def extract_skills(req: ExtractSkillsRequest):
    """استخراج skills من نص باستخدام HybridSkillExtractor"""
    extractor = STATE["extractor"]
    text      = f"{req.title} {req.description}"
    raw       = extractor.extract(text)
    skills    = [s for s in raw.split(",") if s and s != "general"]

    return {
        "skills": [
            {"canonical": s, "confidence": 0.95, "source": "HybridSkillExtractor"}
            for s in skills
        ]
    }


@app.post("/batch-extract-skills", dependencies=[Depends(verify_token)])
def batch_extract_skills(jobs: list[BatchExtractItem]):
    """استخراج skills لمجموعة وظائف دفعة واحدة — بالـ extractor مش keyword matching"""
    extractor = STATE["extractor"]
    texts = [f"{j.title} {j.description}" for j in jobs]
    series = pd.Series(texts)
    results_raw = extractor.extract_series(series).tolist()

    results = []
    for job, raw in zip(jobs, results_raw):
        skills = [s for s in raw.split(",") if s and s != "general"]
        results.append({"jobId": job.id, "skills": skills})

    return {"results": results}


@app.post("/feedback", dependencies=[Depends(verify_token)])
def feedback(event: dict):
    required = {"userId", "jobId", "action"}
    if not required.issubset(event.keys()):
        raise HTTPException(
            status_code=400,
            detail=f"حقول مفقودة: {required - event.keys()}"
        )

    event["timestamp"] = datetime.utcnow().isoformat()
    FEEDBACK_LOG.parent.mkdir(parents=True, exist_ok=True)

    with open(FEEDBACK_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")

    log.info(
        f"feedback | user={event['userId']} | "
        f"job={event['jobId']} | action={event['action']}"
    )
    return {"status": "received"}


@app.get("/feedback/stats", dependencies=[Depends(verify_token)])
def feedback_stats():
    if not FEEDBACK_LOG.exists():
        return {"total": 0, "by_action": {}, "ready_for_retrain": False}

    events = []
    with open(FEEDBACK_LOG, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                events.append(json.loads(line))

    by_action = {}
    for e in events:
        a = e.get("action", "unknown")
        by_action[a] = by_action.get(a, 0) + 1

    return {
        "total":              len(events),
        "by_action":          by_action,
        "ready_for_retrain":  len(events) >= 100,
    }


@app.post("/retrain", dependencies=[Depends(verify_token)])
def trigger_retrain():
    if not FEEDBACK_LOG.exists():
        raise HTTPException(status_code=400, detail="لا توجد ملاحظات بعد")

    events = []
    with open(FEEDBACK_LOG, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                events.append(json.loads(line))

    if len(events) < 50:
        raise HTTPException(
            status_code=400,
            detail=f"يلزم 50 ملاحظة على الأقل. المتوفر: {len(events)}"
        )

    proc = subprocess.Popen(
        [sys.executable, "retrain.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    log.info(f"بدء إعادة التدريب — PID={proc.pid} | events={len(events)}")
    return {"status": "started", "pid": proc.pid, "feedback_events": len(events)}

@app.get("/ping")   
def ping():
    """تحقق سريع إن كل الـ models loaded صح"""
    return {
        "status":         "ok",
        "ranker":         "loaded" if "ranker"    in STATE else "missing",
        "scaler":         "loaded" if "scaler"    in STATE else "missing",
        "index":          STATE["index"].ntotal   if "index"     in STATE else 0,
        "sbert":          "loaded" if "sbert"     in STATE else "missing",
        "extractor":      "loaded" if "extractor" in STATE else "missing",
        "jobs_df_rows":   len(STATE["jobs_df"])   if "jobs_df"   in STATE else 0,
        "feedback_count": sum(1 for _ in open(FEEDBACK_LOG) if _.strip())
                          if FEEDBACK_LOG.exists() else 0,
    }