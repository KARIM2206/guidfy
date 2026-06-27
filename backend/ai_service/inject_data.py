
import json
import random
from pathlib import Path
from datetime import datetime, timedelta

# ─────────────────────────────────────────────────────────────
# Smart Synthetic Feedback Generator v4
# Student-Oriented Ranking Dataset
# Balanced + Realistic + Anti-Overfitting
# ─────────────────────────────────────────────────────────────

log_path = Path("data/feedback_log.jsonl")
log_path.parent.mkdir(parents=True, exist_ok=True)

events = []

# ─────────────────────────────────────────────────────────────
# Jobs
# ─────────────────────────────────────────────────────────────

JOBS = {
    3338: {
        "title": "Junior Frontend React Developer",
        "domain": "frontend",
        "difficulty": 0.30,
    },

    3339: {
        "title": "Next.js Web Developer",
        "domain": "frontend",
        "difficulty": 0.35,
    },

    3340: {
        "title": "UI/UX Internship",
        "domain": "frontend",
        "difficulty": 0.25,
    },

    3341: {
        "title": "Backend Node.js Developer",
        "domain": "backend",
        "difficulty": 0.45,
    },

    3342: {
        "title": "Python Django Backend",
        "domain": "backend",
        "difficulty": 0.50,
    },

    3343: {
        "title": "QA Engineer Internship",
        "domain": "qa",
        "difficulty": 0.20,
    },

    3344: {
        "title": "DevOps Junior Engineer",
        "domain": "devops",
        "difficulty": 0.70,
    },

    3345: {
        "title": "Data Analyst Internship",
        "domain": "data",
        "difficulty": 0.40,
    },

    3346: {
        "title": "Mobile Flutter Developer",
        "domain": "mobile",
        "difficulty": 0.50,
    },

    3347: {
        "title": "Legacy PHP Maintainer",
        "domain": "legacy",
        "difficulty": 0.35,
    },
}

# ─────────────────────────────────────────────────────────────
# User Personas
# ─────────────────────────────────────────────────────────────

USERS = {
    1: {
        "persona": "frontend_student",
        "preferred_domains": ["frontend"],
        "secondary_domains": ["qa"],
        "skill_density": 0.55,
    },

    2: {
        "persona": "backend_student",
        "preferred_domains": ["backend"],
        "secondary_domains": ["data"],
        "skill_density": 0.60,
    },

    3: {
        "persona": "career_switcher",
        "preferred_domains": ["frontend", "mobile"],
        "secondary_domains": ["qa"],
        "skill_density": 0.40,
    },

    4: {
        "persona": "intern_hunter",
        "preferred_domains": ["frontend", "backend", "qa", "data"],
        "secondary_domains": [],
        "skill_density": 0.35,
    },
}

# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def rf(a, b):
    return round(random.uniform(a, b), 3)

def clamp(v, mn=0.0, mx=1.0):
    return round(max(mn, min(mx, v)), 3)

def random_timestamp(days=45):
    now = datetime.now()
    seconds = random.randint(0, days * 24 * 3600)
    return (now - timedelta(seconds=seconds)).isoformat()

# ─────────────────────────────────────────────────────────────
# Feature Generator
# ─────────────────────────────────────────────────────────────

def generate_features(user, job):

    domain = job["domain"]

    # ── Base overlap by preference ─────────────────────────

    if domain in user["preferred_domains"]:
        skill_overlap = rf(0.60, 0.95)

    elif domain in user["secondary_domains"]:
        skill_overlap = rf(0.35, 0.70)

    else:
        skill_overlap = rf(0.00, 0.40)

    # ── Career alignment (less correlated) ────────────────

    career_alignment = clamp(
        (skill_overlap * 0.45) +
        random.uniform(0.10, 0.50)
    )

    # ── Learning gap (inverse but noisy) ──────────────────

    learning_gap_score = clamp(
        (1 - skill_overlap) * random.uniform(0.65, 1.00)
        + random.uniform(-0.12, 0.12)
    )

    # ── LP alignment (semi-correlated) ────────────────────

    lp_alignment = clamp(
        (skill_overlap * 0.55)
        + random.uniform(0.10, 0.45)
    )

    # ── Project similarity ────────────────────────────────

    project_similarity = clamp(
        (skill_overlap * 0.55)
        + random.uniform(0.00, 0.45)
    )

    # ── Experience weak signal ────────────────────────────

    exp_match = 1 if (
        skill_overlap > 0.80 and random.random() < 0.30
    ) else 0

    # ── Freshness ─────────────────────────────────────────

    freshness = rf(0.20, 1.00)

    # ── Retrieval score (imperfect retrieval system) ─────

    retrieval_score = clamp(
        (skill_overlap * random.uniform(0.35, 0.70))
        + random.uniform(0.05, 0.45)
    )

    # ── Important: bad retrieval but good interaction ────

    if random.random() < 0.12:
        retrieval_score *= random.uniform(0.20, 0.50)
        retrieval_score = clamp(retrieval_score)

    return {
        "skill_overlap": skill_overlap,
        "career_alignment": career_alignment,
        "learning_gap_score": learning_gap_score,
        "lp_alignment": lp_alignment,
        "project_similarity": project_similarity,
        "exp_match": exp_match,
        "freshness": freshness,
        "retrieval_score": retrieval_score,
    }

# ─────────────────────────────────────────────────────────────
# Realistic User Behavior
# ─────────────────────────────────────────────────────────────

def choose_action(features):

    overlap = features["skill_overlap"]
    lp = features["lp_alignment"]
    gap = features["learning_gap_score"]

    score = (
        overlap * 0.55 +
        lp * 0.25 -
        gap * 0.20
    )

    r = random.random()

    # ── Strong match ──────────────────────────────────────

    if score >= 0.72:

        if r < 0.60:
            return "apply", 4

        elif r < 0.85:
            return "save", 3

        return "click", 2

    # ── Medium match ──────────────────────────────────────

    elif score >= 0.50:

        if r < 0.45:
            return "save", 3

        elif r < 0.80:
            return "click", 2

        elif r < 0.92:
            return "apply", 4

        return "impression", 1

    # ── Weak match ────────────────────────────────────────

    elif score >= 0.28:

        if r < 0.55:
            return "click", 2

        elif r < 0.85:
            return "impression", 1

        return "dismiss", 0

    # ── Poor match ────────────────────────────────────────

    else:

        if r < 0.65:
            return "dismiss", 0

        return "impression", 1

# ─────────────────────────────────────────────────────────────
# Main Generation
# ─────────────────────────────────────────────────────────────

# realistic interactions
for user_id, user in USERS.items():

    for job_id, job in JOBS.items():

        # balanced repetitions
        reps = random.randint(18, 30)

        for _ in range(reps):

            f = generate_features(user, job)

            action, label = choose_action(f)

            events.append({
                "userId": user_id,
                "jobId": job_id,

                "action": action,
                "label": label,

                "timestamp": random_timestamp(),

                "retrieval_score": f["retrieval_score"],
                "skill_overlap": f["skill_overlap"],
                "exp_match": f["exp_match"],
                "freshness": f["freshness"],
                "career_alignment": f["career_alignment"],
                "learning_gap_score": f["learning_gap_score"],
                "lp_alignment": f["lp_alignment"],
                "project_similarity": f["project_similarity"],

                "user_skill_density": user["skill_density"],
                "job_skill_difficulty": job["difficulty"],
            })

# ─────────────────────────────────────────────────────────────
# Controlled Noise Injection
# ─────────────────────────────────────────────────────────────

REAL_EVENTS_COUNT = len(events)

TARGET_NOISE = int(REAL_EVENTS_COUNT * 0.35)

NOISE_ACTIONS = (
    ["impression"] * 50 +
    ["click"] * 30 +
    ["save"] * 12 +
    ["dismiss"] * 8
)

LABELS = {
    "impression": 1,
    "click": 2,
    "save": 3,
    "dismiss": 0,
}

for _ in range(TARGET_NOISE):

    action = random.choice(NOISE_ACTIONS)

    user_id = random.choice(list(USERS.keys()))
    job_id = random.choice(list(JOBS.keys()))

    # contradictory / imperfect behaviors
    overlap = rf(0.00, 0.95)

    if action == "save" and overlap < 0.20:
        overlap = rf(0.20, 0.45)

    if action == "dismiss" and overlap > 0.70:
        overlap = rf(0.55, 0.90)

    retrieval = rf(0.10, 0.95)

    # imperfect retrieval simulation
    if random.random() < 0.10:
        retrieval *= random.uniform(0.20, 0.50)

    retrieval = clamp(retrieval)

    events.append({
        "userId": user_id,
        "jobId": job_id,

        "action": action,
        "label": LABELS[action],

        "timestamp": random_timestamp(),

        "retrieval_score": retrieval,

        "skill_overlap": overlap,

        "exp_match": random.choice([0, 1]),

        "freshness": rf(0.20, 1.00),

        "career_alignment": rf(0.05, 0.95),

        "learning_gap_score": rf(0.05, 0.95),

        "lp_alignment": rf(0.05, 0.95),

        "project_similarity": rf(0.05, 0.95),

        "user_skill_density": rf(0.20, 0.80),

        "job_skill_difficulty": rf(0.20, 0.80),
    })

# ─────────────────────────────────────────────────────────────
# Shuffle Events
# ─────────────────────────────────────────────────────────────

random.shuffle(events)

# ─────────────────────────────────────────────────────────────
# Save Dataset
# ─────────────────────────────────────────────────────────────

with open(log_path, "w", encoding="utf-8") as f:

    for event in events:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

# ─────────────────────────────────────────────────────────────
# Statistics
# ─────────────────────────────────────────────────────────────

action_counts = {}

for event in events:
    action_counts[event["action"]] = (
        action_counts.get(event["action"], 0) + 1
    )

print("\n✅ Synthetic dataset generated successfully\n")

print("📊 Action Distribution:\n")

for action, count in sorted(action_counts.items()):

    pct = round((count / len(events)) * 100, 1)

    print(f"{action:<12} -> {count:<5} ({pct}%)")

print(f"\n📦 Total Events: {len(events)}")

print(f"🧠 Real Events : {REAL_EVENTS_COUNT}")

print(f"🌪️ Noise Events: {TARGET_NOISE}")

print(f"\n💾 Saved to: {log_path}")

