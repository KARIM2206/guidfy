"""
End-to-End Demo
================
Demonstrates the full recommendation pipeline with mock scraped job data
that mirrors your real n8n scraping output format.
No GPU needed. Falls back gracefully if sentence-transformers not installed.
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
from pprint import pprint

sys.path.insert(0, str(Path(__file__).parent.parent))

from job_recommender.core.skill_extractor import (
    build_user_skill_profile, SkillExtractor
)
from job_recommender.core.feature_engineer import (
    JobRecord, FeatureEngineer
)
from job_recommender.models.ranker import JobRecommender, RecommenderConfig

# ─────────────────────────────────────────────────────────────────────────────
# 1. Simulate scraped jobs (mirrors your real n8n output)
# ─────────────────────────────────────────────────────────────────────────────

SCRAPED_JOBS_RAW = [
    {
        "id": 1,
        "title": "Mid-Level Frontend Developer – Next.js / Angular- Alexandria only",
        "company": "Human Resource Management-1",
        "location": "Alexandria, Egypt",
        "description": """
        We are looking for a talented Frontend Developer to join our growing team.
        
        Requirements:
        • 2-4 years of experience with React.js or Next.js
        • Strong knowledge of Angular 2+ is a plus
        • Proficient in TypeScript and JavaScript (ES6+)
        • Experience with state management (Redux, Zustand)
        • Familiarity with CSS-in-JS solutions (styled-components, Tailwind CSS)
        • Understanding of RESTful APIs and GraphQL
        • Version control with Git / GitHub
        • Excellent problem-solving skills and attention to detail
        
        Nice to have:
        - Experience with testing frameworks (Jest, Cypress)
        - Knowledge of Webpack / Vite bundlers
        - Agile / Scrum methodology experience
        
        We offer competitive salary, flexible hours, and a collaborative environment.
        Join our diverse and inclusive team today!
        """,
        "jobType": "FULL_TIME",
        "applyLink": "https://example.com/apply/1",
        "postedAt": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
        "source": "serpapi",
        "learningPathId": 2,
        "experienceLevel": "mid",
    },
    {
        "id": 2,
        "title": "Senior React Developer - Remote",
        "company": "TechStartup",
        "location": "Remote",
        "description": """
        Senior React Developer needed for fast-growing fintech startup.
        
        Must have:
        - 5+ years React experience (hooks, context, performance optimization)
        - TypeScript proficiency
        - Next.js (SSR/SSG)
        - GraphQL (Apollo Client or Relay)
        - Testing: Jest + React Testing Library
        - Docker for local development
        - Strong Git workflow (PRs, code review)
        
        Architecture experience with micro-frontends is a big plus.
        We work in 2-week sprints using Jira + agile methodology.
        """,
        "jobType": "FULL_TIME",
        "applyLink": "https://example.com/apply/2",
        "postedAt": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
        "source": "linkedin",
        "learningPathId": 2,
        "experienceLevel": "senior",
    },
    {
        "id": 3,
        "title": "Backend Node.js Engineer",
        "company": "E-Commerce Platform",
        "location": "Cairo, Egypt",
        "description": """
        Looking for a Node.js backend engineer with strong database skills.
        
        Key skills:
        - Node.js (Express or NestJS)
        - PostgreSQL / MySQL (query optimization, indexing)
        - Redis for caching
        - REST API design and implementation
        - Microservices architecture
        - Docker & basic Kubernetes knowledge
        - AWS (EC2, S3, Lambda basics)
        - Unit testing (Jest, Mocha)
        """,
        "jobType": "FULL_TIME",
        "applyLink": "https://example.com/apply/3",
        "postedAt": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
        "source": "serpapi",
        "learningPathId": 3,
        "experienceLevel": "mid",
    },
    {
        "id": 4,
        "title": "Junior Vue.js Developer",
        "company": "Digital Agency",
        "location": "Cairo, Egypt",
        "description": """
        Entry-level Vue.js developer for our frontend team.
        
        You should know:
        - Vue.js 3 (Composition API)
        - JavaScript fundamentals
        - HTML5, CSS3 (Tailwind preferred)
        - Basic Git usage
        
        We'll train you on our stack! Fresh graduates welcome.
        Good communication skills and eagerness to learn are more important than experience.
        """,
        "jobType": "FULL_TIME",
        "applyLink": "https://example.com/apply/4",
        "postedAt": (datetime.now(timezone.utc) - timedelta(days=45)).isoformat(),
        "source": "linkedin",
        "learningPathId": 2,
        "experienceLevel": "junior",
    },
    {
        "id": 5,
        "title": "DevOps Engineer – AWS / Kubernetes",
        "company": "Cloud Solutions",
        "location": "Dubai, UAE",
        "description": """
        Senior DevOps Engineer for our infrastructure team.
        
        Requirements:
        - AWS (EKS, ECS, Lambda, CloudFormation, S3)
        - Kubernetes / Helm chart management
        - Docker containerization
        - Terraform / Pulumi for IaC
        - CI/CD pipelines (GitHub Actions, Jenkins)
        - Linux administration and bash scripting
        - Monitoring: Prometheus, Grafana, ELK Stack
        """,
        "jobType": "FULL_TIME",
        "applyLink": "https://example.com/apply/5",
        "postedAt": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
        "source": "serpapi",
        "learningPathId": 4,
        "experienceLevel": "senior",
    },
]


def _parse_scraped_job(raw: dict) -> JobRecord:
    posted_at = None
    if raw.get("postedAt"):
        try:
            posted_at = datetime.fromisoformat(raw["postedAt"].replace("Z", "+00:00"))
        except ValueError:
            pass
    return JobRecord(
        id=raw["id"],
        title=raw["title"],
        description=raw["description"],
        company=raw["company"],
        location=raw.get("location"),
        job_type=raw.get("jobType", "FULL_TIME"),
        experience_level=raw.get("experienceLevel"),
        learning_path_id=raw.get("learningPathId", 1),
        learning_path_title=raw.get("learningPathTitle", ""),
        posted_at=posted_at,
        source=raw.get("source", ""),
        apply_link=raw.get("applyLink"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. Run demo
# ─────────────────────────────────────────────────────────────────────────────

def run_demo():
    print("=" * 65)
    print("  Job Recommendation Engine — End-to-End Demo")
    print("=" * 65)

    # ── Step 1: NLP Skill Extraction demo ────────────────────────────────
    print("\n📝 Step 1: Extracting skills from noisy job descriptions...\n")
    extractor = SkillExtractor(use_fuzzy=False)   # fast mode for demo

    for raw_job in SCRAPED_JOBS_RAW[:2]:
        skills = extractor.extract_to_set(raw_job["description"], title=raw_job["title"])
        print(f"  Job: {raw_job['title'][:55]}")
        print(f"  Extracted skills: {sorted(skills)}\n")

    # ── Step 2: Build user profiles ───────────────────────────────────────
    print("=" * 65)
    print("👤 Step 2: Building user skill profiles from LP progress...\n")

    users_config = [
        {
            "name": "Ahmed (70% Frontend Track)",
            "user_id": 1,
            "lp_title": "Frontend Developer Track",
            "progress": 70,
            "declared": ["react", "typescript", "css"],
        },
        {
            "name": "Sara (30% Frontend Track — Beginner)",
            "user_id": 2,
            "lp_title": "Frontend Developer Track",
            "progress": 30,
            "declared": ["html", "css", "javascript"],
        },
        {
            "name": "Mohamed (90% Backend Track — Advanced)",
            "user_id": 3,
            "lp_title": "Backend Developer Track",
            "progress": 90,
            "declared": ["nodejs", "postgresql", "docker", "aws"],
        },
    ]

    jobs = [_parse_scraped_job(r) for r in SCRAPED_JOBS_RAW]
    recommender = JobRecommender(
        config=RecommenderConfig(top_n=5, use_shap=False)
    )

    for ucfg in users_config:
        user = build_user_skill_profile(
            user_id=ucfg["user_id"],
            learning_path_title=ucfg["lp_title"],
            progress_percent=ucfg["progress"],
            user_declared_skills=ucfg["declared"],
        )

        print(f"\n{'─'*60}")
        print(f"👤 User: {ucfg['name']}")
        print(f"   Skills: {sorted(user.skill_set)}")

        print(f"\n   🎯 Top Job Recommendations:\n")
        results = recommender.recommend(user, jobs)

        for i, r in enumerate(results, 1):
            print(f"   #{i}  [{r.score:.3f}] {r.title}")
            print(f"        Company: {r.company} | {r.location}")
            print(f"        Matched: {r.matched_skills}")
            print(f"        Missing: {r.missing_skills} ({r.skill_gap_pct*100:.0f}% gap)")
            for explanation_line in r.explanation:
                print(f"        {explanation_line}")
            print()

    # ── Step 3: JSON output sample ─────────────────────────────────────────
    print("=" * 65)
    print("📦 Step 3: Sample JSON output (as returned by /recommend API)\n")
    user = build_user_skill_profile(1, "Frontend Developer Track", 70,
                                    ["react", "typescript"])
    results = recommender.recommend(user, jobs)
    if results:
        print(json.dumps(recommender.result_to_dict(results[0]), indent=2))

    print("\n✅ Demo complete!")


if __name__ == "__main__":
    run_demo()
