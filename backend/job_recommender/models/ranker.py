"""
Ranking Model
==============
Hybrid ranking system combining:
  1. LambdaMART (LightGBM) — listwise Learning-to-Rank
  2. Two-Tower semantic similarity — job tower + user tower
  3. Hybrid score fusion: final = α·LTR + β·semantic

Training strategy:
  - Weak supervision from user behaviour (clicks, applications → implicit labels)
  - Heuristic label generation for cold-start (no interaction data yet)
  - SHAP for feature importance → explainability

Cold-start (no data): pure feature-weighted scoring via FeatureVector weights.
"""

import os
import json
import logging
import pickle
from dataclasses import dataclass, field
from typing import Optional
from pathlib import Path

import numpy as np

from job_recommender.core.feature_engineer import (
    FeatureVector, FeatureEngineer, RecommendationResult,
    JobRecord, generate_explanation
)
from job_recommender.core.skill_extractor import UserSkillProfile

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent / "models" / "saved"


# ─────────────────────────────────────────────────────────────────────────────
# Cold-start fallback: rule-based weighted scoring
# ─────────────────────────────────────────────────────────────────────────────

FEATURE_WEIGHTS = {
    "skill_overlap_score":     0.25,
    "skill_coverage_score":    0.20,
    "skill_gap_score":        -0.15,   # negative: more gap = lower score
    "skill_depth_score":       0.10,
    "lp_alignment_score":      0.15,
    "experience_level_match":  0.10,
    "semantic_similarity":     0.15,
    "title_similarity":        0.05,
    "location_match":          0.05,
    "freshness_score":         0.05,
}

assert abs(sum(v for v in FEATURE_WEIGHTS.values())) <= 1.01


def rule_based_score(fv: FeatureVector) -> float:
    """Deterministic fallback when no trained model is available."""
    fv_dict = {
        k: getattr(fv, k)
        for k in FEATURE_WEIGHTS
    }
    raw = sum(w * fv_dict[k] for k, w in FEATURE_WEIGHTS.items())
    # Normalize to 0–1 (approximate, given weight magnitudes)
    return max(0.0, min(1.0, (raw + 0.15) / 0.95))


# ─────────────────────────────────────────────────────────────────────────────
# LambdaMART Ranker (LightGBM)
# ─────────────────────────────────────────────────────────────────────────────

class LTRModel:
    """
    LambdaMART ranker using LightGBM.
    Supports training from (features, labels, groups) and prediction.
    """

    def __init__(self):
        self.model = None
        self._lgb = None

    def _import_lgb(self):
        if self._lgb is None:
            try:
                import lightgbm as lgb
                self._lgb = lgb
            except ImportError:
                raise ImportError(
                    "lightgbm not installed. Run: pip install lightgbm"
                )
        return self._lgb

    def train(
        self,
        X: np.ndarray,           # (N_pairs, N_features)
        y: np.ndarray,           # (N_pairs,) relevance labels 0–3
        groups: list[int],       # sizes of query groups
        n_estimators: int = 500,
        learning_rate: float = 0.05,
        num_leaves: int = 31,
        valid_data: Optional[tuple] = None,
    ):
        """
        Train LambdaMART model.

        Labels convention:
          3 = highly relevant (applied, hired)
          2 = relevant (clicked, saved)
          1 = somewhat relevant (viewed)
          0 = not relevant (skipped)

        For cold-start: generate heuristic labels from feature scores.
        """
        lgb = self._import_lgb()

        train_data = lgb.Dataset(
            X, label=y,
            group=groups,
            free_raw_data=False
        )

        params = {
            "objective":       "lambdarank",
            "metric":          "ndcg",
            "ndcg_eval_at":    [5, 10],
            "learning_rate":   learning_rate,
            "num_leaves":      num_leaves,
            "min_data_in_leaf": 5,
            "verbose":         -1,
            "boosting_type":   "gbdt",
            "n_jobs":          -1,
        }

        callbacks = [lgb.early_stopping(50), lgb.log_evaluation(100)]

        valid_sets = [train_data]
        valid_names = ["train"]

        if valid_data:
            Xv, yv, gv = valid_data
            vd = lgb.Dataset(Xv, label=yv, group=gv, reference=train_data)
            valid_sets.append(vd)
            valid_names.append("valid")

        self.model = lgb.train(
            params,
            train_data,
            num_boost_round=n_estimators,
            valid_sets=valid_sets,
            valid_names=valid_names,
            callbacks=callbacks,
        )

        logger.info(
            f"LTR model trained | best_iteration={self.model.best_iteration}"
        )

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Returns ranking scores for each row."""
        if self.model is None:
            raise RuntimeError("Model not trained or loaded")
        return self.model.predict(X)

    def feature_importance(self) -> dict[str, float]:
        if self.model is None:
            return {}
        names = FeatureVector.feature_names()
        gains = self.model.feature_importance(importance_type="gain")
        total = gains.sum() + 1e-9
        return {n: float(g / total) for n, g in zip(names, gains)}

    def save(self, path: Optional[Path] = None):
        path = path or MODEL_DIR / "ltr_model.pkl"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump(self.model, f)
        logger.info(f"LTR model saved to {path}")

    def load(self, path: Optional[Path] = None):
        path = path or MODEL_DIR / "ltr_model.pkl"
        if not path.exists():
            logger.warning(f"No saved LTR model at {path}; cold-start mode active")
            return False
        with open(path, "rb") as f:
            self.model = pickle.load(f)
        logger.info(f"LTR model loaded from {path}")
        return True


# ─────────────────────────────────────────────────────────────────────────────
# Two-Tower Encoder (SBERT-based)
# ─────────────────────────────────────────────────────────────────────────────

class TwoTowerEncoder:
    """
    Job tower  : encodes job title + description + skills
    User tower : encodes LP title + skill set + progress context
    Score      : cosine similarity
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    def _get_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
                logger.info(f"Two-tower encoder loaded: {self.model_name}")
            except ImportError:
                raise ImportError(
                    "sentence-transformers not installed. "
                    "Run: pip install sentence-transformers"
                )
        return self._model

    def encode_jobs(self, jobs: list[JobRecord]) -> np.ndarray:
        model = self._get_model()
        texts = [
            f"Job: {j.title}. Skills: {', '.join(j.extracted_skills[:20])}. "
            f"{j.description[:300]}"
            for j in jobs
        ]
        return model.encode(texts, normalize_embeddings=True,
                            batch_size=32, show_progress_bar=False)

    def encode_user(self, user: UserSkillProfile) -> np.ndarray:
        model = self._get_model()
        skill_list = ", ".join(sorted(user.skill_set)[:20])
        text = (
            f"Developer profile: {user.learning_path_title}. "
            f"Progress: {user.raw_progress_pct:.0f}%. "
            f"Skills: {skill_list}"
        )
        return model.encode(text, normalize_embeddings=True)

    def score(self, user_emb: np.ndarray, job_embs: np.ndarray) -> np.ndarray:
        """Returns cosine similarities of shape (N_jobs,)."""
        return job_embs @ user_emb


# ─────────────────────────────────────────────────────────────────────────────
# SHAP Explainer wrapper
# ─────────────────────────────────────────────────────────────────────────────

class SHAPExplainer:
    """Wraps SHAP TreeExplainer for LightGBM models."""

    def __init__(self, ltr_model: LTRModel):
        self.ltr_model = ltr_model
        self._explainer = None

    def _get_explainer(self):
        if self._explainer is None and self.ltr_model.model is not None:
            try:
                import shap
                self._explainer = shap.TreeExplainer(self.ltr_model.model)
            except ImportError:
                logger.warning("shap not installed; SHAP explanations disabled")
        return self._explainer

    def explain(self, X: np.ndarray) -> Optional[np.ndarray]:
        """Returns SHAP values of shape (N, N_features) or None."""
        exp = self._get_explainer()
        if exp is None:
            return None
        try:
            return exp.shap_values(X)
        except Exception as e:
            logger.debug(f"SHAP failed: {e}")
            return None

    def top_features(
        self, shap_row: np.ndarray, n: int = 3
    ) -> dict[str, float]:
        names = FeatureVector.feature_names()
        pairs = list(zip(names, shap_row.tolist()))
        pairs.sort(key=lambda x: abs(x[1]), reverse=True)
        return dict(pairs[:n])


# ─────────────────────────────────────────────────────────────────────────────
# Main Recommender Engine
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class RecommenderConfig:
    alpha: float = 0.65           # weight for LTR score
    beta: float = 0.35            # weight for semantic similarity
    top_n: int = 10               # number of results to return
    min_score_threshold: float = 0.10
    use_shap: bool = True


class JobRecommender:
    """
    Production-ready Job Recommendation Engine.

    Pipeline:
      1. Extract skills from raw job descriptions (NLP)
      2. Build user skill profile from LP progress
      3. Compute feature vectors for all (user, job) pairs
      4. Score with LTR + Two-Tower hybrid
      5. Generate explanations with SHAP
      6. Return Top-N ranked recommendations
    """

    def __init__(self, config: Optional[RecommenderConfig] = None):
        self.config = config or RecommenderConfig()
        self.feature_engineer = FeatureEngineer()
        self.ltr = LTRModel()
        self.two_tower = TwoTowerEncoder()
        self.shap_explainer = None
        self._ltr_available = False
        self._init_models()

    def _init_models(self):
        """Try to load pre-trained models; fall back to cold-start if missing."""
        loaded = self.ltr.load()
        if loaded:
            self._ltr_available = True
            if self.config.use_shap:
                self.shap_explainer = SHAPExplainer(self.ltr)
        else:
            logger.info("Running in cold-start mode (rule-based scoring)")

    # ─── Main recommendation entry point ──────────────────────────────────

    def recommend(
        self,
        user: UserSkillProfile,
        jobs: list[JobRecord],
        user_location: Optional[str] = None,
    ) -> list[RecommendationResult]:
        """
        Main entry point. Returns sorted list of RecommendationResult.

        Args:
            user:           built via build_user_skill_profile()
            jobs:           list of JobRecord (from DB / scraper)
            user_location:  optional user city/country string

        Returns:
            Top-N RecommendationResult sorted by score desc
        """
        if not jobs:
            return []

        cfg = self.config

        # Step 1: Extract skills from all jobs (batch)
        for job in jobs:
            if not job.extracted_skills:
                job.extracted_skills = list(
                    self.feature_engineer.extractor.extract_to_set(
                        job.description, title=job.title
                    )
                )

        # Step 2: Compute feature vectors
        feature_vectors = self.feature_engineer.compute_batch(
            user, jobs, user_location=user_location
        )

        X = np.array([fv.to_list() for fv in feature_vectors])

        # Step 3: LTR scores
        if self._ltr_available:
            ltr_scores = self.ltr.predict(X)
            # Normalize LTR scores to [0, 1]
            ltr_min, ltr_max = ltr_scores.min(), ltr_scores.max()
            if ltr_max > ltr_min:
                ltr_scores = (ltr_scores - ltr_min) / (ltr_max - ltr_min)
        else:
            ltr_scores = np.array([rule_based_score(fv) for fv in feature_vectors])

        # Step 4: Two-tower semantic scores
        try:
            user_emb = self.two_tower.encode_user(user)
            job_embs = self.two_tower.encode_jobs(jobs)
            semantic_scores = self.two_tower.score(user_emb, job_embs)
        except Exception as e:
            logger.warning(f"Two-tower encoding failed: {e}; using fallback")
            semantic_scores = np.array([fv.semantic_similarity for fv in feature_vectors])

        # Step 5: Hybrid fusion
        final_scores = cfg.alpha * ltr_scores + cfg.beta * semantic_scores
        final_scores = np.clip(final_scores, 0, 1)

        # Step 6: SHAP explanations
        shap_rows = None
        if self.shap_explainer is not None and self._ltr_available:
            shap_matrix = self.shap_explainer.explain(X)
            if shap_matrix is not None:
                shap_rows = shap_matrix

        # Step 7: Build results
        results = []
        for i, (job, fv) in enumerate(zip(jobs, feature_vectors)):
            score = float(final_scores[i])
            if score < cfg.min_score_threshold:
                continue

            shap_values = None
            if shap_rows is not None:
                shap_values = self.shap_explainer.top_features(shap_rows[i])

            result = generate_explanation(user, job, fv, score, shap_values)
            results.append(result)

        # Sort by score desc, return top-N
        results.sort(key=lambda r: -r.score)
        return results[:cfg.top_n]

    # ─── Training helpers ─────────────────────────────────────────────────

    def generate_heuristic_labels(
        self,
        users: list[UserSkillProfile],
        jobs: list[JobRecord],
    ) -> tuple[np.ndarray, np.ndarray, list[int]]:
        """
        Generate weak-supervision labels for cold-start training.
        Uses rule-based score to approximate relevance.

        Returns:
            X        : feature matrix
            y        : relevance labels (0–3)
            groups   : query group sizes (one group per user)
        """
        all_X, all_y, groups = [], [], []

        for user in users:
            user_jobs = [j for j in jobs
                         if j.learning_path_id == user.user_id
                         or True]  # all jobs for cold-start
            fvs = self.feature_engineer.compute_batch(user, user_jobs)
            scores = np.array([rule_based_score(fv) for fv in fvs])

            # Discretize to relevance labels
            labels = np.zeros(len(scores), dtype=int)
            labels[scores > 0.70] = 3
            labels[(scores > 0.50) & (scores <= 0.70)] = 2
            labels[(scores > 0.30) & (scores <= 0.50)] = 1

            all_X.extend([fv.to_list() for fv in fvs])
            all_y.extend(labels.tolist())
            groups.append(len(user_jobs))

        return (
            np.array(all_X),
            np.array(all_y),
            groups
        )

    def train(
        self,
        users: list[UserSkillProfile],
        jobs: list[JobRecord],
        interaction_data: Optional[list[dict]] = None,
    ):
        """
        Full training pipeline.

        interaction_data (optional): list of {user_id, job_id, label} dicts
        If not provided, uses heuristic weak supervision.
        """
        logger.info("Starting LTR training...")

        if interaction_data:
            # Build supervised labels from interactions
            X, y, groups = self._build_supervised_data(
                users, jobs, interaction_data
            )
        else:
            # Heuristic / cold-start labels
            X, y, groups = self.generate_heuristic_labels(users, jobs)

        # Train/valid split (80/20 by users)
        split = int(len(groups) * 0.8)
        g_train = groups[:split]
        g_valid = groups[split:]
        n_train = sum(g_train)
        X_train, y_train = X[:n_train], y[:n_train]
        X_valid, y_valid = X[n_train:], y[n_train:]

        self.ltr.train(
            X_train, y_train, g_train,
            valid_data=(X_valid, y_valid, g_valid)
        )
        self.ltr.save()
        self._ltr_available = True
        self.shap_explainer = SHAPExplainer(self.ltr)
        logger.info("Training complete.")

    def _build_supervised_data(
        self,
        users: list[UserSkillProfile],
        jobs: list[JobRecord],
        interactions: list[dict],
    ) -> tuple[np.ndarray, np.ndarray, list[int]]:
        """Build X, y, groups from real interaction logs."""
        user_map = {u.user_id: u for u in users}
        job_map = {j.id: j for j in jobs}
        inter_map: dict[int, dict[int, int]] = {}  # user_id → job_id → label

        for rec in interactions:
            uid = rec["user_id"]
            jid = rec["job_id"]
            lbl = rec.get("label", 1)
            inter_map.setdefault(uid, {})[jid] = lbl

        all_X, all_y, groups = [], [], []

        for uid, user in user_map.items():
            if uid not in inter_map:
                continue
            user_jobs = [j for jid, j in job_map.items() if jid in inter_map[uid]]
            if not user_jobs:
                continue
            fvs = self.feature_engineer.compute_batch(user, user_jobs)
            labels = [inter_map[uid].get(j.id, 0) for j in user_jobs]
            all_X.extend([fv.to_list() for fv in fvs])
            all_y.extend(labels)
            groups.append(len(user_jobs))

        return np.array(all_X), np.array(all_y), groups

    # ─── Result serialization ─────────────────────────────────────────────

    @staticmethod
    def result_to_dict(r: RecommendationResult) -> dict:
        """Convert result to JSON-serializable dict for API response."""
        return {
            "jobId":          r.job_id,
            "title":          r.title,
            "company":        r.company,
            "location":       r.location,
            "jobType":        r.job_type,
            "applyLink":      r.apply_link,
            "learningPathId": r.learning_path_id,
            "score":          r.score,
            "matchedSkills":  r.matched_skills,
            "missingSkills":  r.missing_skills,
            "skillGapPct":    round(r.skill_gap_pct * 100, 1),
            "explanation":    r.explanation,
            "features": {
                "skillOverlap":        round(r.features.skill_overlap_score, 3),
                "skillCoverage":       round(r.features.skill_coverage_score, 3),
                "lpAlignment":         round(r.features.lp_alignment_score, 3),
                "experienceMatch":     round(r.features.experience_level_match, 3),
                "semanticSimilarity":  round(r.features.semantic_similarity, 3),
                "freshness":           round(r.features.freshness_score, 3),
            }
        }
