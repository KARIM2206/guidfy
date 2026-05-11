"""
ai-service/retrain.py
يشتغل عبر:  npm run retrain
            (بعد ما exportFeedback.js يكتب feedback_log.jsonl)
"""

import json
import logging
import shutil
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import lightgbm as lgb
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import ndcg_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("retrain")

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE         = Path(__file__).parent
MODELS       = BASE / "models"
DATA         = BASE / "data"
FEEDBACK_LOG = DATA / "feedback_log.jsonl"

# ── Features ──────────────────────────────────────────────────────────────────
FEATURES = [
    "retrieval_score",
    "skill_overlap",
    "exp_match",
    "freshness",
    "salary_score",
    "career_alignment",
    "user_skill_density",
    "job_skill_difficulty",
    "learning_gap_score",
    "company_popularity",
    "industry_similarity",
    "lp_alignment",
]

# الـ features دي بتتعمل لها scale — غير الـ binary زي exp_match
SCALE_FEATURES = [
    "retrieval_score",
    "career_alignment",
    "user_skill_density",
    "job_skill_difficulty",
    "learning_gap_score",
    "company_popularity",
    "industry_similarity",
    "salary_score",
]

LABEL_MAP = {"apply": 3, "save": 2, "click": 1, "impression": 0, "dismiss": -1}

# ── القيم الافتراضية للـ features اللي مش موجودة في الفيدباك ─────────────────
FEATURE_DEFAULTS = {
    "retrieval_score":      0.5,
    "salary_score":         0.5,
    "user_skill_density":   0.5,
    "job_skill_difficulty": 0.5,
    "company_popularity":   0.3,
    "industry_similarity":  0.3,
}


# ─────────────────────────────────────────────────────────────────────────────
def load_feedback() -> pd.DataFrame:
    """يحمّل feedback_log.jsonl (اللي كتبه exportFeedback.js) ويحوّله DataFrame."""

    if not FEEDBACK_LOG.exists():
        raise FileNotFoundError(
            f"feedback_log.jsonl مش موجود في {FEEDBACK_LOG}\n"
            "شغّل الـ export script الأول: node backend/scripts/exportFeedback.js"
        )

    lines = [l for l in FEEDBACK_LOG.read_text(encoding="utf-8").strip().split("\n") if l.strip()]
    if not lines:
        raise ValueError("feedback_log.jsonl فاضي — محتاج فيدباك حقيقي أولاً")

    events = [json.loads(l) for l in lines]
    df = pd.DataFrame(events)

    # ── label ──
    df["label"] = df["action"].map(LABEL_MAP).fillna(0).astype(int)

    # ── استخرج matchDetails ──
    details = df["matchDetails"].apply(lambda x: x if isinstance(x, dict) else {})
    df["skill_overlap"]      = details.apply(lambda x: float(x.get("skillOverlap",  0.0)))
    df["exp_match"]          = details.apply(lambda x: float(x.get("expMatch",      False)))
    df["freshness"]          = details.apply(lambda x: float(x.get("freshness",     0.5)))
    df["career_alignment"]   = details.apply(lambda x: float(x.get("careerFit",     0.0)))
    df["learning_gap_score"] = details.apply(lambda x: float(x.get("learningGap",   0.5)))
    df["lp_alignment"]       = details.apply(lambda x: float(x.get("lpAlignment",   0.5)))

    # ── القيم الافتراضية للـ features الناقصة ──
    for col, default in FEATURE_DEFAULTS.items():
        if col not in df.columns:
            df[col] = default

    return (
        df[["userId", "jobId", "label"] + FEATURES]
        .rename(columns={"userId": "user_id", "jobId": "job_id"})
    )


# ─────────────────────────────────────────────────────────────────────────────
def retrain() -> dict:
    log.info("=" * 60)
    log.info("Starting Retrain")
    log.info("=" * 60)

    # ── 1. حمّل الفيدباك ──────────────────────────────────────────────────────
    feedback_df = load_feedback()
    log.info(f"Feedback events loaded: {len(feedback_df):,}")
    log.info(f"Label distribution:\n{feedback_df['label'].value_counts().sort_index()}")

    # ── 2. دمج مع الـ feature store القديم ───────────────────────────────────
    feature_store_path = DATA / "feature_store.parquet"

    if feature_store_path.exists():
        existing_df = pd.read_parquet(feature_store_path)
        log.info(f"Feature store loaded: {len(existing_df):,} rows")
        # الفيدباك الحقيقي أهم — نكرّره 3 مرات كـ oversampling بسيط
        combined_df = pd.concat(
            [existing_df] + [feedback_df] * 3,
            ignore_index=True,
        )
    else:
        log.warning("No feature store found — training on feedback only")
        combined_df = feedback_df.copy()

    log.info(f"Combined training data: {len(combined_df):,} rows")

    # ── 3. Clean + Scale ──────────────────────────────────────────────────────
    combined_df = combined_df.fillna(0).replace([float("inf"), float("-inf")], 0)

    scaler_path = MODELS / "feature_scaler.pkl"
    if scaler_path.exists():
        scaler = joblib.load(scaler_path)
        combined_df[SCALE_FEATURES] = scaler.transform(combined_df[SCALE_FEATURES])
    else:
        log.warning("No scaler found — skipping normalization")

    # ── 4. Train / Test split (by user) ──────────────────────────────────────
    combined_df = combined_df.sort_values("user_id")
    users = combined_df["user_id"].unique()

    # لو عدد الـ users صغير خليه كله train
    if len(users) < 5:
        log.warning(f"Only {len(users)} users — using all data for training, no test split")
        train_df = combined_df
        test_df  = combined_df.copy()
    else:
        train_users, test_users = train_test_split(users, test_size=0.2, random_state=42)
        train_df = combined_df[combined_df["user_id"].isin(train_users)].sort_values("user_id")
        test_df  = combined_df[combined_df["user_id"].isin(test_users)].sort_values("user_id")

    X_train = train_df[FEATURES]
    y_train = train_df["label"].clip(lower=0)
    X_test  = test_df[FEATURES]
    y_test  = test_df["label"].clip(lower=0)

    train_groups = train_df.groupby("user_id", sort=False).size().tolist()
    test_groups  = test_df.groupby("user_id", sort=False).size().tolist()

    # ── 5. Train LambdaMART ───────────────────────────────────────────────────
    min_child = max(5, len(feedback_df) // 50)

    ranker = lgb.LGBMRanker(
        objective="lambdarank",
        metric="ndcg",
        n_estimators=300,
        learning_rate=0.05,
        num_leaves=24,
        min_child_samples=min_child,
        reg_alpha=0.1,
        reg_lambda=0.1,
        random_state=42,
        verbose=-1,
    )

    log.info(f"Training with min_child_samples={min_child} ...")
    ranker.fit(
        X_train, y_train,
        group=train_groups,
        eval_set=[(X_test, y_test)],
        eval_group=[test_groups],
        callbacks=[lgb.log_evaluation(50)],
    )

    # ── 6. Evaluate ───────────────────────────────────────────────────────────
    new_preds = ranker.predict(X_test)
    labels    = y_test.values

    try:
        new_ndcg = ndcg_score([labels], [new_preds], k=10)
    except Exception:
        new_ndcg = 0.0

    log.info(f"New model NDCG@10: {new_ndcg:.4f}")

    # ── 7. قارن مع النموذج القديم ─────────────────────────────────────────────
    old_model_path = MODELS / "lambdamart_model.txt"
    timestamp      = datetime.now().strftime("%Y%m%d_%H%M%S")
    old_ndcg       = 0.0

    if old_model_path.exists():
        try:
            old_ranker = lgb.Booster(model_file=str(old_model_path))
            old_preds  = old_ranker.predict(X_test)
            old_ndcg   = ndcg_score([labels], [old_preds], k=10)
        except Exception as e:
            log.warning(f"Could not evaluate old model: {e}")

        log.info(f"Old model NDCG@10: {old_ndcg:.4f}")
    else:
        log.warning("No existing model found — saving new model directly")

    # ── 8. احفظ النموذج لو أحسن (أو مفيش قديم) ───────────────────────────────
    TOLERANCE = 0.01  # بيسيب مجال بسيط — مش لازم يكون أحسن بالضبط

    if not old_model_path.exists() or new_ndcg >= old_ndcg - TOLERANCE:
        MODELS.mkdir(parents=True, exist_ok=True)

        # backup القديم لو موجود
        if old_model_path.exists():
            shutil.copy(old_model_path, MODELS / f"lambdamart_model_backup_{timestamp}.txt")

        ranker.booster_.save_model(str(old_model_path))
        improved = True
        log.info(f"✅ New model saved  (NDCG: {old_ndcg:.4f} → {new_ndcg:.4f})")
    else:
        # احتفظ بالـ candidate بس متحطوش في production
        ranker.booster_.save_model(str(MODELS / f"lambdamart_model_candidate_{timestamp}.txt"))
        improved = False
        log.warning(f"⚠️  New model worse ({new_ndcg:.4f} < {old_ndcg:.4f}) — keeping old model")

    # ── 9. Feature importance ─────────────────────────────────────────────────
    importance = sorted(
        zip(FEATURES, ranker.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )
    log.info("Feature Importance:")
    for feat, score in importance:
        log.info(f"  {feat:<25} {score:.1f}")

    return {
        "status":        "improved" if improved else "no_improvement",
        "old_ndcg":      round(old_ndcg, 4),
        "new_ndcg":      round(new_ndcg, 4),
        "feedback_used": len(feedback_df),
        "total_rows":    len(combined_df),
        "timestamp":     timestamp,
    }


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    result = retrain()
    log.info(f"\n{'=' * 60}\nRetrain Complete\n{json.dumps(result, indent=2)}")