"""
retrain.py — LightGBM LambdaMART Retraining Pipeline (v4.1 Production)
Unified 9 features, strict JSON unpacking, full metrics, automatic backup.
Adjusted hyperparameters for robust performance on current dataset scales.
"""
import json
import logging
import shutil
import argparse
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split

from utils.validators import validate_feature_schema, ValidationError
from utils.metrics import ndcg_score, map_score, mrr_score
from services.feature_builder import FEATURES
from services.feedback_service import FeedbackService

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("retrain")

# ── Paths ───────────────────────────────────────────────────────────────────
BASE = Path(__file__).parent
MODELS = BASE / "models"
DATA = BASE / "data"

FEEDBACK_LOG = DATA / "feedback_log.jsonl"

# ── Unified Label Map (0-based, no negative labels) ──────────────────────────
LABEL_MAP = {
    "dismiss": 0,
    "impression": 1,
    "click": 2,
    "save": 3,
    "apply": 4,
}

FEATURE_DEFAULTS = {
    "retrieval_score": np.nan,
    "skill_overlap": np.nan,
    "exp_match": np.nan,
    "freshness": np.nan,
    "career_alignment": np.nan,
    "learning_gap_score": np.nan,
    "lp_alignment": np.nan,
    "user_skill_density": np.nan,
    "job_skill_difficulty": np.nan,
}

# Mapping: JSONL column name → canonical feature name
COLUMN_ALIASES = {
    "retrieval_score": "retrieval_score",
    "skill_overlap": "skill_overlap",
    "exp_match": "exp_match",
    "freshness": "freshness",
    "career_alignment": "career_alignment",
    "learning_gap_score": "learning_gap_score",
    "lp_alignment": "lp_alignment",
    "user_skill_density": "user_skill_density",
    "job_skill_difficulty": "job_skill_difficulty",
    "skillOverlap": "skill_overlap",
    "expMatch": "exp_match",
    "careerFit": "career_alignment",
    "learningGap": "learning_gap_score",
    "lpAlignment": "lp_alignment",
    "userSkillDensity": "user_skill_density",
    "jobSkillDifficulty": "job_skill_difficulty",
}


def extract_features_from_row(row: dict) -> dict:
    """
    Extract the 9 unified features from a single feedback row.
    Supports flat columns and nested matchDetails.
    Returns NaN for genuinely missing values.
    """
    result = {"user_id": row.get("userId"), "job_id": row.get("jobId"), "label": LABEL_MAP.get(row.get("action"), 0)}

    # Try flat columns first
    for json_key, feat_name in COLUMN_ALIASES.items():
        if json_key in row:
            val = row[json_key]
            if val is None or val == "" or val == "null":
                result[feat_name] = np.nan
            else:
                try:
                    result[feat_name] = float(val)
                except (ValueError, TypeError):
                    result[feat_name] = np.nan

    # If nothing found, try matchDetails nested
    if "matchDetails" in row and isinstance(row["matchDetails"], dict):
        md = row["matchDetails"]
        if "features" in md and isinstance(md["features"], dict):
            target_dict = md["features"]
        else:
            target_dict = md

        for json_key, feat_name in COLUMN_ALIASES.items():
            if json_key in target_dict and feat_name not in result:
                val = target_dict[json_key]
                if val is None or val == "" or val == "null":
                    result[feat_name] = np.nan
                else:
                    try:
                        result[feat_name] = float(val)
                    except (ValueError, TypeError):
                        result[feat_name] = np.nan

    # Fill any missing features with NaN
    for feat in FEATURES:
        if feat not in result:
            result[feat] = np.nan

    return result


def _is_corrupt_row(row: dict) -> bool:
    """
    Returns True if the row has corrupt/uncomputed features.

    A row is corrupt when freshness = 0 — this is impossible for a real job
    (even a 179-day-old job has freshness ≈ 0.006), so freshness = 0 means
    the features were logged before they were properly computed.
    """
    freshness = row.get("freshness")
    if freshness is None:
        return True
    try:
        return float(freshness) == 0.0
    except (ValueError, TypeError):
        return True


def load_feedback() -> pd.DataFrame:
    """Load feedback_log.jsonl, filter corrupt rows, unpack features, and validate."""
    if not FEEDBACK_LOG.exists():
        return pd.DataFrame(columns=["user_id", "job_id", "label"] + FEATURES)

    parsed_rows = []
    corrupt_count = 0

    with open(FEEDBACK_LOG, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                raw_event = json.loads(line)

                # ── فلتر الـ corrupt rows قبل ما تتضاف للـ training ──────────
                if _is_corrupt_row(raw_event):
                    corrupt_count += 1
                    continue

                parsed_rows.append(extract_features_from_row(raw_event))
            except json.JSONDecodeError:
                continue

    if corrupt_count:
        log.warning(f"Skipped {corrupt_count} corrupt rows (freshness=0 or null)")

    df = pd.DataFrame(parsed_rows)

    if df.empty:
        return df

    # Validate schema
    try:
        validate_feature_schema(df, FEATURES)
    except ValidationError as e:
        log.error(f"Schema validation failed: {e}")
        raise

    # Feature statistics
    log.info("Feature statistics:")
    for feat in FEATURES:
        col = df[feat]
        missing_rate = col.isna().mean() * 100
        if col.notna().sum() > 0:
            log.info(
                f"  {feat:<25} mean={col.mean():.3f}  std={col.std():.3f}  "
                f"missing={missing_rate:.1f}%"
            )
        else:
            log.warning(f"  {feat:<25} ALL MISSING")

    # Label distribution
    log.info(f"Label distribution:\n{df['label'].value_counts().sort_index()}")

    return df[["user_id", "job_id", "label"] + FEATURES]


def retrain() -> dict:
    log.info("=" * 60)
    log.info("Starting Retrain v4.1")
    log.info("=" * 60)

    # ── 1. Load feedback ──────────────────────────────────────────────────────
    feedback_df = load_feedback()
    if feedback_df.empty:
        log.error("No valid feedback data found. Aborting retrain.")
        return {"status": "failed", "reason": "empty_data"}

    log.info(f"Feedback events loaded: {len(feedback_df):,}")

    # ── 2. Prepare Data ───────────────────────────────────────────────────────
    combined_df = feedback_df.copy()
    log.info(f"Training data: {len(combined_df):,} rows")

    # ── 3. Clean ───────────────────────────────────────────────────────────────
    combined_df = combined_df.replace([float("inf"), float("-inf")], np.nan)

    # ── 4. Train / Test split (by user to avoid leakage) ─────────────────────
    combined_df = combined_df.sort_values("user_id")
    users = combined_df["user_id"].unique()

    evaluation_skipped = False
    evaluation_reason = ""

    if len(users) < 5:
        log.warning(f"Only {len(users)} users — skipping evaluation to prevent leakage.")
        train_df = combined_df
        test_df = None
        evaluation_skipped = True
        evaluation_reason = "Insufficient unique users"
    else:
        train_users, test_users = train_test_split(users, test_size=0.2, random_state=42)
        train_df = combined_df[combined_df["user_id"].isin(train_users)].sort_values("user_id")
        test_df = combined_df[combined_df["user_id"].isin(test_users)].sort_values("user_id")

    X_train = train_df[FEATURES]
    y_train = train_df["label"]
    train_groups = train_df.groupby("user_id", sort=False).size().tolist()

    # ── 5. Train LambdaMART ───────────────────────────────────────────────────
    ranker = lgb.LGBMRanker(
        objective="lambdarank",
        metric="ndcg",
        ndcg_eval_at=[5, 10],
        n_estimators=100,
        learning_rate=0.05,
        num_leaves=15,
        max_depth=4,
        min_child_samples=2,
        min_data_per_group=1,
        reg_alpha=0.1,
        reg_lambda=0.1,
        random_state=42,
        verbose=-1
    )

    log.info("Training LambdaMART Ranker with dynamic local scale adjustments...")
    
    if evaluation_skipped:
        ranker.fit(
            X_train, y_train,
            group=train_groups,
        )
        new_ndcg5 = new_ndcg10 = new_map = new_mrr = None
    else:
        X_test = test_df[FEATURES]
        y_test = test_df["label"]
        test_groups = test_df.groupby("user_id", sort=False).size().tolist()
        
        ranker.fit(
            X_train, y_train,
            group=train_groups,
            eval_set=[(X_test, y_test)],
            eval_group=[test_groups],
            callbacks=[lgb.log_evaluation(50)],
        )

        # ── 6. Evaluate ──────────────────────────────────────────────────────────
        new_preds = ranker.predict(X_test)
        labels = y_test.values

        new_ndcg5 = ndcg_score(labels, new_preds, k=5)
        new_ndcg10 = ndcg_score(labels, new_preds, k=10)
        new_map = map_score(labels, new_preds, k=10)
        new_mrr = mrr_score(labels, new_preds, k=10)

        log.info(f"New model NDCG@5:  {new_ndcg5:.4f}")
        log.info(f"New model NDCG@10: {new_ndcg10:.4f}")
        log.info(f"New model MAP@10:  {new_map:.4f}")
        log.info(f"New model MRR@10:  {new_mrr:.4f}")

    # ── 7. Compare with old model ────────────────────────────────────────────
    old_model_path = MODELS / "lambdamart_model.txt"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    old_ndcg5 = old_ndcg10 = old_map = old_mrr = 0.0

    if not evaluation_skipped and old_model_path.exists():
        try:
            old_ranker = lgb.Booster(model_file=str(old_model_path))
            old_preds = old_ranker.predict(X_test)
            old_ndcg5 = ndcg_score(labels, old_preds, k=5)
            old_ndcg10 = ndcg_score(labels, old_preds, k=10)
            old_map = map_score(labels, old_preds, k=10)
            old_mrr = mrr_score(labels, old_preds, k=10)
            log.info(f"Old model NDCG@5:  {old_ndcg5:.4f}")
            log.info(f"Old model NDCG@10: {old_ndcg10:.4f}")
            log.info(f"Old model MAP@10:  {old_map:.4f}")
            log.info(f"Old model MRR@10:  {old_mrr:.4f}")
        except Exception as e:
            log.warning(f"Could not evaluate old model: {e}")
    else:
        log.warning("No existing model found or evaluation skipped — saving new model directly")

    # ── 8. Save model ───────────────────────────────────────────────────────
    TOLERANCE = 0.01
    improved = True

    if evaluation_skipped or not old_model_path.exists() or new_ndcg10 >= old_ndcg10 - TOLERANCE:
        MODELS.mkdir(parents=True, exist_ok=True)
        if old_model_path.exists():
            backup = MODELS / f"lambdamart_model_backup_{timestamp}.txt"
            shutil.copy(old_model_path, backup)
            log.info(f"Backup saved: {backup.name}")
        ranker.booster_.save_model(str(old_model_path))
        if evaluation_skipped:
            log.info("✅ New model saved (Evaluation skipped)")
        else:
            log.info(f"✅ New model saved (NDCG@10: {old_ndcg10:.4f} → {new_ndcg10:.4f})")
    else:
        candidate = MODELS / f"lambdamart_model_candidate_{timestamp}.txt"
        ranker.booster_.save_model(str(candidate))
        improved = False
        log.warning(f"⚠️  New model worse ({new_ndcg10:.4f} < {old_ndcg10:.4f}) — keeping old model")

    # ── 9. Save model_meta.json ──────────────────────────────────────────────
    meta = {
        "version": "4.1",
        "timestamp": timestamp,
        "features": FEATURES,
        "scale_features": [],
        "n_features": len(FEATURES),
        "feature_defaults": {k: "NaN" if np.isnan(v) else v for k, v in FEATURE_DEFAULTS.items()},
        "exp_map": {
            "Entry level": 0, "entry level": 0, "Entry": 0,
            "Associate": 2,
            "Mid-Senior level": 5, "Mid": 3, "mid-senior level": 5,
            "Senior": 7, "Director": 10, "Executive": 15,
        },
        "label_map": LABEL_MAP,
        "training_rows": len(combined_df),
        "feedback_rows": len(feedback_df),
        "ndcg_at_5": round(new_ndcg5, 4) if new_ndcg5 is not None else None,
        "ndcg_at_10": round(new_ndcg10, 4) if new_ndcg10 is not None else None,
        "map_at_10": round(new_map, 4) if new_map is not None else None,
        "mrr_at_10": round(new_mrr, 4) if new_mrr is not None else None,
        "evaluation_status": "skipped" if evaluation_skipped else "completed",
        "evaluation_reason": evaluation_reason if evaluation_skipped else ""
    }
    meta_path = MODELS / "model_meta.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    log.info(f"model_meta.json saved ({len(FEATURES)} features)")

    # ── 10. Feature importance ────────────────────────────────────────────────
    importance = sorted(
        zip(FEATURES, ranker.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )
    log.info("Feature Importance:")
    for feat, score in importance:
        log.info(f"  {feat:<25} {score:.1f}")

    result = {
        "status": "improved" if improved else "no_improvement",
        "old_ndcg_at_5": round(old_ndcg5, 4) if old_ndcg5 else None,
        "new_ndcg_at_5": round(new_ndcg5, 4) if new_ndcg5 is not None else None,
        "old_ndcg_at_10": round(old_ndcg10, 4) if old_ndcg10 else None,
        "new_ndcg_at_10": round(new_ndcg10, 4) if new_ndcg10 is not None else None,
        "old_map_at_10": round(old_map, 4) if old_map else None,
        "new_map_at_10": round(new_map, 4) if new_map is not None else None,
        "old_mrr_at_10": round(old_mrr, 4) if old_mrr else None,
        "new_mrr_at_10": round(new_mrr, 4) if new_mrr is not None else None,
        "evaluation_status": "skipped" if evaluation_skipped else "completed",
        "feedback_used": len(feedback_df),
        "total_rows": len(combined_df),
        "timestamp": timestamp,
        "features": FEATURES,
    }
    log.info(f"{'=' * 60}")
    log.info("Retrain Complete")
    log.info(f"{json.dumps(result, indent=2)}")
    return result


if __name__ == "__main__":
    retrain()