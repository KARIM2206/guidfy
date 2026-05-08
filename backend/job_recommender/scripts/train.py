"""
Training Script
================
Trains the LambdaMART ranking model using heuristic weak supervision.
Run this once to bootstrap the model, then retrain periodically
as real interaction data accumulates.

Usage:
    python -m job_recommender.scripts.train
    python -m job_recommender.scripts.train --with-interactions interactions.json
"""

import sys
import json
import random
import logging
import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Allow running from project root
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from job_recommender.core.skill_extractor import (
    build_user_skill_profile, SKILL_TAXONOMY
)
from job_recommender.core.feature_engineer import JobRecord
from job_recommender.models.ranker import JobRecommender, RecommenderConfig

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

RANDOM_SEED = 42
random.seed(RANDOM_SEED)


# ─────────────────────────────────────────────────────────────────────────────
# Synthetic data generators (for cold-start bootstrapping)
# ─────────────────────────────────────────────────────────────────────────────

JOB_TEMPLATES = [
    {
        "title": "Mid-Level Frontend Developer – Next.js / Angular",
        "company": "Tech Corp",
        "location": "Cairo, Egypt",
        "lp_title": "Frontend Developer Track",
        "exp_level": "mid",
        "desc_skills": ["react", "nextjs", "angular", "typescript", "css",
                        "redux", "git", "agile"],
    },
    {
        "title": "Senior React Developer",
        "company": "StartupXYZ",
        "location": "Remote",
        "lp_title": "Frontend Developer Track",
        "exp_level": "senior",
        "desc_skills": ["react", "typescript", "nextjs", "graphql", "jest",
                        "git", "docker", "restapi"],
    },
    {
        "title": "Backend Engineer – Node.js & PostgreSQL",
        "company": "FinTech Ltd",
        "location": "Alexandria, Egypt",
        "lp_title": "Backend Developer Track",
        "exp_level": "mid",
        "desc_skills": ["nodejs", "postgresql", "redis", "restapi", "docker",
                        "aws", "git", "microservices"],
    },
    {
        "title": "Junior Python Developer",
        "company": "DataCo",
        "location": "Cairo, Egypt",
        "lp_title": "Python Backend Track",
        "exp_level": "junior",
        "desc_skills": ["python", "django", "postgresql", "restapi", "git", "linux"],
    },
    {
        "title": "Full Stack Developer – React + Node.js",
        "company": "Agency Inc",
        "location": "Remote",
        "lp_title": "Fullstack Developer Track",
        "exp_level": "mid",
        "desc_skills": ["react", "nodejs", "postgresql", "typescript",
                        "docker", "git", "restapi"],
    },
    {
        "title": "DevOps Engineer – AWS & Kubernetes",
        "company": "CloudOps",
        "location": "Dubai, UAE",
        "lp_title": "DevOps Track",
        "exp_level": "senior",
        "desc_skills": ["aws", "kubernetes", "docker", "terraform", "cicd",
                        "linux", "python", "git"],
    },
    {
        "title": "Data Scientist – Machine Learning",
        "company": "AI Labs",
        "location": "Remote",
        "lp_title": "Data Science Track",
        "exp_level": "mid",
        "desc_skills": ["python", "machine_learning", "pytorch", "tensorflow",
                        "sql", "data_science", "git"],
    },
    {
        "title": "Mobile Developer – React Native",
        "company": "AppFactory",
        "location": "Cairo, Egypt",
        "lp_title": "Mobile Developer Track",
        "exp_level": "junior",
        "desc_skills": ["react_native", "javascript", "typescript", "redux",
                        "restapi", "git"],
    },
    {
        "title": "Vue.js Frontend Engineer",
        "company": "E-Commerce Co",
        "location": "Remote",
        "lp_title": "Frontend Developer Track",
        "exp_level": "mid",
        "desc_skills": ["vue", "javascript", "typescript", "css", "restapi",
                        "git", "agile"],
    },
    {
        "title": "Software Engineer – Java Spring Boot",
        "company": "Enterprise Ltd",
        "location": "Cairo, Egypt",
        "lp_title": "Backend Developer Track",
        "exp_level": "senior",
        "desc_skills": ["java", "postgresql", "kafka", "docker", "restapi",
                        "microservices", "kubernetes"],
    },
]

LP_TRACKS = [
    ("Frontend Developer Track", 85),
    ("Frontend Developer Track", 45),
    ("Backend Developer Track", 70),
    ("Fullstack Developer Track", 60),
    ("DevOps Track", 90),
    ("Data Science Track", 55),
    ("Mobile Developer Track", 40),
    ("Python Backend Track", 75),
]


def _make_job_record(template: dict, job_id: int) -> JobRecord:
    """Build JobRecord from a template with noisy description."""
    noise_phrases = [
        "We are looking for a talented",
        "Join our growing team!",
        "Competitive salary and benefits.",
        "Must be a team player.",
        "Excellent communication skills required.",
        "We value diversity and inclusion.",
    ]

    skill_sentences = []
    for skill in template["desc_skills"]:
        skill_sentences.append(f"Experience with {skill} is required.")

    description = (
        f"{random.choice(noise_phrases)} {template['title']}.\n\n"
        "Requirements:\n"
        + "\n".join(f"• {s}" for s in skill_sentences)
        + f"\n\n{random.choice(noise_phrases)}"
        + "\n\nNice to have: agile, jira, git, communication skills"
    )

    days_ago = random.randint(0, 60)
    posted_at = datetime.now(timezone.utc) - timedelta(days=days_ago)

    return JobRecord(
        id=job_id,
        title=template["title"],
        description=description,
        company=template["company"],
        location=template["location"],
        job_type=random.choice(["FULL_TIME", "CONTRACT", "REMOTE"]),
        experience_level=template["exp_level"],
        learning_path_id=random.randint(1, 5),
        learning_path_title=template["lp_title"],
        posted_at=posted_at,
        source="synthetic",
        apply_link=f"https://example.com/jobs/{job_id}",
    )


def generate_synthetic_dataset(n_users: int = 80, n_jobs_per_template: int = 3):
    """Generate synthetic users and jobs for training."""
    logger.info(f"Generating {n_users} synthetic users...")

    users = []
    for i in range(n_users):
        lp_title, progress = random.choice(LP_TRACKS)
        # Add some randomness to progress
        progress = max(5, min(100, progress + random.randint(-20, 20)))
        declared = random.sample(list(SKILL_TAXONOMY.keys()), k=random.randint(0, 4))
        user = build_user_skill_profile(
            user_id=i + 1,
            learning_path_title=lp_title,
            progress_percent=progress,
            user_declared_skills=declared,
        )
        users.append(user)

    logger.info(f"Generating {len(JOB_TEMPLATES) * n_jobs_per_template} synthetic jobs...")
    jobs = []
    job_id = 1
    for _ in range(n_jobs_per_template):
        for template in JOB_TEMPLATES:
            jobs.append(_make_job_record(template, job_id))
            job_id += 1

    return users, jobs


# ─────────────────────────────────────────────────────────────────────────────
# Main training entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Train Job Recommender LTR Model")
    parser.add_argument(
        "--with-interactions", type=str, default=None,
        help="Path to JSON file with [{user_id, job_id, label}] interaction data"
    )
    parser.add_argument(
        "--n-users", type=int, default=100,
        help="Number of synthetic users (cold-start only)"
    )
    args = parser.parse_args()

    # Initialize recommender
    config = RecommenderConfig(top_n=10, use_shap=True)
    recommender = JobRecommender(config=config)

    # Load interaction data if provided
    interactions = []
    if args.with_interactions:
        with open(args.with_interactions) as f:
            interactions = json.load(f)
        logger.info(f"Loaded {len(interactions)} interaction records")

    # Generate dataset
    users, jobs = generate_synthetic_dataset(n_users=args.n_users)
    logger.info(f"Dataset: {len(users)} users, {len(jobs)} jobs")

    # Train
    recommender.train(users, jobs, interaction_data=interactions or None)

    # ── Quick evaluation ──────────────────────────────────────────────────
    logger.info("Running quick evaluation on 3 sample users...")
    for u in users[:3]:
        results = recommender.recommend(u, jobs[:20])
        logger.info(
            f"User {u.user_id} | LP: {u.learning_path_title[:30]} "
            f"| Progress: {u.raw_progress_pct:.0f}% "
            f"| Top result: '{results[0].title if results else 'None'}' "
            f"| Score: {results[0].score:.3f if results else 0}"
        )

    logger.info("Training complete! Model saved to models/saved/ltr_model.pkl")


if __name__ == "__main__":
    main()
