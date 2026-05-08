"""
Prisma → Recommender Data Adapter
===================================
Converts raw Prisma/Node.js DB output to recommender input types.

Usage from Node.js:
  1. Fetch user + LP data from Prisma
  2. POST to /recommend endpoint (this is handled in api/routes.py)

This file is for when running the recommender DIRECTLY with Python
(e.g., in a background job or batch process).

It mirrors the exact Prisma schema structure you provided.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime

from .core.skill_extractor import build_user_skill_profile, UserSkillProfile
from .core.feature_engineer import JobRecord


# ─────────────────────────────────────────────────────────────────────────────
# Type mirrors for Prisma output (JSON parsed from Node.js)
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class PrismaUserLearningPath:
    """Mirrors UserLearningPath + included relations from Prisma."""
    id: int
    userId: int
    learningPathId: int
    enrolledAt: str
    learningPath: dict   # includes title, description, etc.


@dataclass
class PrismaJob:
    """Mirrors Job model from Prisma after scraping."""
    id: int
    title: str
    description: str
    company: str
    location: Optional[str]
    jobType: str
    status: str
    learningPathId: int
    learningPath: dict           # included relation
    experienceLevel: Optional[str]
    postedAt: Optional[str]
    applyLink: Optional[str]
    source: Optional[str]
    skills: Optional[list]       # pre-extracted skills JSON column (may be None)


# ─────────────────────────────────────────────────────────────────────────────
# Adapter functions
# ─────────────────────────────────────────────────────────────────────────────

def prisma_user_to_profile(
    user_id: int,
    enrollments: list[dict],       # UserLearningPath rows with learningPath included
    progress_data: dict,           # {learningPathId: progressPercent}
    user_title: Optional[str] = None,  # User.title field (job title the user has)
) -> UserSkillProfile:
    """
    Convert Prisma user data to UserSkillProfile for the recommender.

    Args:
        user_id:        DB user ID
        enrollments:    list of UserLearningPath rows (with learningPath included)
        progress_data:  map of learningPathId → progress % 
                        (computed from UserStepProgress or UserRoadmapProgress)
        user_title:     optional User.title field (e.g., "Frontend Developer")

    Returns:
        UserSkillProfile ready for recommender input
    """
    if not enrollments:
        # No LP enrollment → empty profile
        return UserSkillProfile(
            user_id=user_id,
            skills={},
            learning_path_title=user_title or "General",
            raw_progress_pct=0.0,
        )

    # Use the most recent / highest-progress enrollment
    best_enrollment = None
    best_progress = -1

    for enrollment in enrollments:
        lp_id = enrollment["learningPathId"]
        progress = progress_data.get(lp_id, 0.0)
        if progress > best_progress:
            best_progress = progress
            best_enrollment = enrollment

    lp_title = (best_enrollment or {}).get("learningPath", {}).get("title", "")

    # Extract declared skills from User.title if available
    declared_skills = [user_title] if user_title else []

    return build_user_skill_profile(
        user_id=user_id,
        learning_path_title=lp_title,
        progress_percent=best_progress,
        user_declared_skills=declared_skills or None,
    )


def prisma_job_to_record(job: dict) -> JobRecord:
    """
    Convert a Prisma Job dict (with learningPath included) to JobRecord.

    The `job` dict should come from:
        prisma.job.findMany({ include: { learningPath: true } })
    """
    posted_at = None
    if job.get("postedAt"):
        try:
            ts = job["postedAt"]
            if isinstance(ts, str):
                posted_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            elif isinstance(ts, datetime):
                posted_at = ts
        except ValueError:
            pass

    lp = job.get("learningPath") or {}
    lp_title = lp.get("title", "")

    # Use pre-extracted skills if available in the skills JSON column
    pre_extracted = []
    if job.get("skills"):
        try:
            skills_data = job["skills"]
            if isinstance(skills_data, list):
                pre_extracted = [
                    s if isinstance(s, str) else s.get("canonical", "")
                    for s in skills_data
                ]
        except Exception:
            pass

    record = JobRecord(
        id=job["id"],
        title=job["title"],
        description=job["description"],
        company=job["company"],
        location=job.get("location"),
        job_type=job.get("jobType", "FULL_TIME"),
        experience_level=job.get("experienceLevel"),
        learning_path_id=job["learningPathId"],
        learning_path_title=lp_title,
        posted_at=posted_at,
        source=job.get("source", ""),
        apply_link=job.get("applyLink"),
    )

    if pre_extracted:
        record.extracted_skills = [s for s in pre_extracted if s]

    return record


def compute_lp_progress_from_steps(
    user_id: int,
    step_progress_rows: list[dict],    # UserStepProgress rows
    roadmap_steps_count: dict[int, int],  # learningPathId → total steps
) -> dict[int, float]:
    """
    Compute progress percentage per LP from step-level progress data.
    
    Returns: {learningPathId: progress_percent}
    """
    completed: dict[int, int] = {}
    for row in step_progress_rows:
        if row.get("userId") != user_id:
            continue
        if not row.get("completedAt"):
            continue
        lp_id = row.get("learningPathId")
        if lp_id:
            completed[lp_id] = completed.get(lp_id, 0) + 1

    result = {}
    for lp_id, total in roadmap_steps_count.items():
        done = completed.get(lp_id, 0)
        result[lp_id] = min(100.0, (done / max(total, 1)) * 100)

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Node.js Prisma query examples (for documentation / copy-paste)
# ─────────────────────────────────────────────────────────────────────────────

NODEJS_PRISMA_QUERIES = """
// ── Fetch user enrollment data ──────────────────────────────────────────────
const enrollments = await prisma.userLearningPath.findMany({
  where: { userId: userId },
  include: { learningPath: { select: { id: true, title: true } } },
});

// ── Compute LP progress from step completions ───────────────────────────────
const stepProgress = await prisma.userStepProgress.findMany({
  where: { userId: userId },
  select: { learningPathId: true, completedAt: true },
});

// ── Fetch published jobs for recommendation ──────────────────────────────────
const jobs = await prisma.job.findMany({
  where: {
    status: 'PUBLISHED',
    deadline: { gte: new Date() },
  },
  include: { learningPath: { select: { title: true } } },
  take: 200,   // cap at 200 for performance
  orderBy: { postedAt: 'desc' },
});

// ── Call recommendation API ──────────────────────────────────────────────────
const response = await fetch('http://ai-service:8000/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-token': process.env.INTERNAL_API_TOKEN,
  },
  body: JSON.stringify({
    user: {
      userId,
      learningPathTitle: enrollments[0]?.learningPath?.title || '',
      progressPercent: progressData[enrollments[0]?.learningPathId] || 0,
      declaredSkills: [],
    },
    jobs: jobs.map(j => ({
      id: j.id, title: j.title, description: j.description,
      company: j.company, location: j.location, jobType: j.jobType,
      learningPathId: j.learningPathId, experienceLevel: j.experienceLevel,
      applyLink: j.applyLink, postedAt: j.postedAt?.toISOString(),
    })),
    topN: 10,
  }),
});

const { recommendations } = await response.json();
// recommendations = [{ jobId, title, score, explanation, matchedSkills, missingSkills, ... }]
"""
