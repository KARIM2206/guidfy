"""
Job Recommendation API
=======================
FastAPI service exposing the recommendation engine to the Node.js backend.

Endpoints:
  POST /recommend          – get Top-N jobs for a user
  POST /extract-skills     – extract skills from raw text (for admin tools)
  GET  /health             – health check
  POST /train              – trigger model retraining (admin only)

Designed to run as a sidecar Python service alongside the Node.js backend.
Node.js calls this API via HTTP (axios / node-fetch).
"""

from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ..core.skill_extractor import build_user_skill_profile, SkillExtractor
from ..core.feature_engineer import JobRecord
from ..models.ranker import JobRecommender, RecommenderConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# App init
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Job Recommendation Engine",
    description="AI-powered ranking system for job recommendations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000",
                   os.getenv("FRONTEND_URL", "")],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton recommender (loaded once on startup)
_recommender: Optional[JobRecommender] = None


@app.on_event("startup")
async def startup():
    global _recommender
    config = RecommenderConfig(
        alpha=float(os.getenv("LTR_WEIGHT", "0.65")),
        beta=float(os.getenv("SEMANTIC_WEIGHT", "0.35")),
        top_n=int(os.getenv("TOP_N", "10")),
        use_shap=os.getenv("USE_SHAP", "true").lower() == "true",
    )
    _recommender = JobRecommender(config=config)
    logger.info("Recommender engine initialized")


def get_recommender() -> JobRecommender:
    if _recommender is None:
        raise HTTPException(status_code=503, detail="Recommender not initialized")
    return _recommender


def verify_internal_token(x_internal_token: str = Header(default="")):
    """Simple shared-secret auth for internal service calls from Node.js."""
    expected = os.getenv("INTERNAL_API_TOKEN", "")
    if expected and x_internal_token != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response schemas
# ─────────────────────────────────────────────────────────────────────────────

class UserProfileRequest(BaseModel):
    userId: int
    learningPathTitle: str
    progressPercent: float = Field(ge=0, le=100)
    declaredSkills: list[str] = []
    location: Optional[str] = None


class JobInput(BaseModel):
    id: int
    title: str
    description: str
    company: str
    location: Optional[str] = None
    jobType: str = "FULL_TIME"
    experienceLevel: Optional[str] = None
    learningPathId: int
    learningPathTitle: str = ""
    applyLink: Optional[str] = None
    postedAt: Optional[str] = None          # ISO 8601
    source: Optional[str] = None


class RecommendRequest(BaseModel):
    user: UserProfileRequest
    jobs: list[JobInput]
    topN: Optional[int] = Field(default=None, ge=1, le=50)


class ExtractSkillsRequest(BaseModel):
    title: str = ""
    description: str
    useFuzzy: bool = True


class TrainRequest(BaseModel):
    """Admin endpoint: trigger retraining from interaction logs."""
    interactions: list[dict] = []   # [{user_id, job_id, label}]
    # Users and jobs fetched from DB inside the service


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _parse_job(j: JobInput) -> JobRecord:
    posted_at = None
    if j.postedAt:
        try:
            posted_at = datetime.fromisoformat(j.postedAt.replace("Z", "+00:00"))
        except ValueError:
            pass

    return JobRecord(
        id=j.id,
        title=j.title,
        description=j.description,
        company=j.company,
        location=j.location,
        job_type=j.jobType,
        experience_level=j.experienceLevel,
        learning_path_id=j.learningPathId,
        learning_path_title=j.learningPathTitle,
        posted_at=posted_at,
        source=j.source or "",
        apply_link=j.applyLink,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": _recommender is not None and _recommender._ltr_available,
        "mode": "ltr" if (_recommender and _recommender._ltr_available) else "rule-based",
    }


@app.post("/recommend", dependencies=[Depends(verify_internal_token)])
async def recommend(
    req: RecommendRequest,
    recommender: JobRecommender = Depends(get_recommender),
):
    """
    Main recommendation endpoint.

    Called by Node.js backend with:
      - User's LP title + progress + declared skills
      - List of scraped jobs (raw, unprocessed)

    Returns Top-N ranked jobs with scores + explanations.
    """
    try:
        # Build user profile
        user = build_user_skill_profile(
            user_id=req.user.userId,
            learning_path_title=req.user.learningPathTitle,
            progress_percent=req.user.progressPercent,
            user_declared_skills=req.user.declaredSkills or None,
        )

        # Parse jobs
        jobs = [_parse_job(j) for j in req.jobs]

        # Override top-N if specified in request
        if req.topN:
            old_n = recommender.config.top_n
            recommender.config.top_n = req.topN

        # Run recommendation
        results = recommender.recommend(
            user=user,
            jobs=jobs,
            user_location=req.user.location,
        )

        if req.topN:
            recommender.config.top_n = old_n

        return {
            "userId":    req.user.userId,
            "userSkills": list(user.skill_set),
            "lpProgress": req.user.progressPercent,
            "totalJobs": len(jobs),
            "recommendations": [
                recommender.result_to_dict(r) for r in results
            ],
        }

    except Exception as e:
        logger.exception("Recommendation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract-skills", dependencies=[Depends(verify_internal_token)])
async def extract_skills(req: ExtractSkillsRequest):
    """
    Extract skills from raw job text.
    Useful for populating the `skills` JSON column in the Job table.
    """
    extractor = SkillExtractor(use_fuzzy=req.useFuzzy)
    skills = extractor.extract(req.description, include_title=req.title)
    return {
        "skills": [
            {
                "canonical": s.canonical,
                "rawMention": s.raw_mention,
                "confidence": round(s.confidence, 3),
                "source": s.source,
            }
            for s in skills
        ]
    }


@app.post("/batch-extract-skills", dependencies=[Depends(verify_internal_token)])
async def batch_extract_skills(jobs: list[JobInput]):
    """
    Batch skill extraction for all scraped jobs.
    Called by n8n pipeline post-scraping to pre-populate skills column.
    """
    extractor = SkillExtractor(use_fuzzy=True)
    results = []
    for job in jobs:
        skill_set = extractor.extract_to_set(job.description, title=job.title)
        results.append({
            "jobId":  job.id,
            "skills": sorted(list(skill_set)),
        })
    return {"results": results}


@app.post("/train", dependencies=[Depends(verify_internal_token)])
async def trigger_training(
    req: TrainRequest,
    recommender: JobRecommender = Depends(get_recommender),
):
    """
    Admin endpoint: trigger LTR model retraining.
    In production: call this from a cron job or n8n workflow weekly.
    """
    # In production: fetch users & jobs from DB here
    # For now: returns instruction message
    return {
        "status": "Training triggered",
        "note": (
            "In production, connect to DB to fetch users and jobs. "
            "Call recommender.train(users, jobs, req.interactions)"
        ),
        "interactionsProvided": len(req.interactions),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Node.js Integration Example (returned as documentation)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/integration-guide")
def integration_guide():
    return {
        "nodejsExample": {
            "description": "Call from Node.js/NestJS service",
            "code": """
// services/recommendation.service.ts
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN;

async function getRecommendations(userId: number, lpTitle: string, progress: number, jobs: Job[]) {
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/recommend`,
    {
      user: { userId, learningPathTitle: lpTitle, progressPercent: progress },
      jobs: jobs.map(j => ({
        id: j.id, title: j.title, description: j.description,
        company: j.company, jobType: j.jobType,
        learningPathId: j.learningPathId, postedAt: j.postedAt,
      })),
    },
    { headers: { 'x-internal-token': INTERNAL_TOKEN } }
  );
  return data.recommendations;
}
"""
        }
    }
