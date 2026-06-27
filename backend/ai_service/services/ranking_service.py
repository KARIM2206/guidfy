"""
ranking_service.py
Ranking with Maximal Marginal Relevance (MMR) for diversity.

Uses compute_score() from FeatureBuilder directly instead of LightGBM,
ensuring skill-overlap-first logic is applied correctly at ranking time.
"""
import logging
from typing import List, Dict, Any, Optional
import numpy as np

from .skill_normalizer import SkillNormalizer
from .feature_builder import FeatureBuilder

log = logging.getLogger("ranking_service")

MIN_OVERLAP = 0.05


class RankingService:
    """
    Ranks job candidates using FeatureBuilder.compute_score() + MMR diversity penalty.

    LightGBM ranker is kept as an optional fallback for future use once
    retrained on the new feature schema.
    """

    def __init__(
        self,
        ranker=None,
        feature_order: Optional[List[str]] = None,
        normalizer: Optional[SkillNormalizer] = None,
    ):
        self.ranker = ranker                          # optional — not used yet
        self.feature_order = feature_order or []
        self.normalizer = normalizer or SkillNormalizer()
        self._feature_builder = FeatureBuilder(normalizer=self.normalizer)

    def rank(
        self,
        candidates: List[Dict[str, Any]],
        top_n: int = 5,
        lambda_param: float = 0.7,
    ) -> List[Dict[str, Any]]:
        """
        Rank candidates using compute_score() + MMR greedy selection.

        Filters out candidates with skill_overlap < MIN_OVERLAP before MMR.
        No-overlap candidates are appended at the end if top_n requires more.

        Args:
            candidates:    list of {"job": jobObj, "features": dict}
            top_n:         how many results to return
            lambda_param:  MMR trade-off — higher = more relevance, less diversity

        Returns:
            List of top_n dicts: {"rank", "candidate", "raw_score"}
            sorted by MMR score descending.
        """
        log.warning("NEW ranking_service — compute_score path active")
        if not candidates:
            return []

        # ── 1. Split by overlap threshold ───────────────────────────────────
        viable = [
            c for c in candidates
            if c["features"].get("skill_overlap", 0) >= MIN_OVERLAP
        ]
        no_overlap = [
            c for c in candidates
            if c["features"].get("skill_overlap", 0) < MIN_OVERLAP
        ]

        results: List[Dict[str, Any]] = []

        # ── 2. Rank VIABLE candidates with MMR ──────────────────────────────
        if viable:
            base_scores = np.array([
                self._feature_builder.compute_score(c["features"])
                for c in viable
            ])

            log.debug(
                "base_scores (viable=%d, no_overlap=%d) — min=%.3f  max=%.3f  mean=%.3f",
                len(viable),
                len(no_overlap),
                base_scores.min(),
                base_scores.max(),
                base_scores.mean(),
            )

            selected: List[int] = []
            remaining: List[int] = list(range(len(viable)))

            while len(selected) < min(top_n, len(viable)):
                best_idx: Optional[int] = None
                best_mmr: float = -np.inf

                for idx in remaining:
                    relevance = base_scores[idx]

                    # Diversity penalty = max Jaccard similarity with already-selected jobs
                    max_sim = max(
                        (
                            self._skill_similarity(viable[idx], viable[sel_idx])
                            for sel_idx in selected
                        ),
                        default=0.0,
                    )

                    mmr = lambda_param * relevance - (1 - lambda_param) * max_sim
                    if mmr > best_mmr:
                        best_mmr = mmr
                        best_idx = idx

                if best_idx is None:
                    break

                selected.append(best_idx)
                remaining.remove(best_idx)

            for rank, idx in enumerate(selected, start=1):
                results.append({
                    "rank": rank,
                    "candidate": viable[idx],
                    "raw_score": float(base_scores[idx]),
                })

        # ── 3. Append NO-OVERLAP candidates if we still need more ───────────
        if len(results) < top_n and no_overlap:
            no_scores = [
                (c, self._feature_builder.compute_score(c["features"]))
                for c in no_overlap
            ]
            no_scores.sort(key=lambda x: x[1], reverse=True)

            needed = top_n - len(results)
            for i, (cand, score) in enumerate(no_scores):
                if i >= needed:
                    break
                results.append({
                    "rank": len(results) + 1,
                    "candidate": cand,
                    "raw_score": float(score),
                })

        return results

    # ──────────────────────────────────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _skill_similarity(self, cand_a: Dict, cand_b: Dict) -> float:
        """Jaccard similarity between two jobs' skill sets (used for MMR diversity)."""
        job_a = cand_a.get("job")
        job_b = cand_b.get("job")
        if not job_a or not job_b:
            return 0.0

        skills_a = self.normalizer.parse(getattr(job_a, "skills", None))
        skills_b = self.normalizer.parse(getattr(job_b, "skills", None))
        if not skills_a or not skills_b:
            return 0.0

        union = skills_a | skills_b
        return len(skills_a & skills_b) / len(union) if union else 0.0

    # ──────────────────────────────────────────────────────────────────────────
    # Score normalization
    # ──────────────────────────────────────────────────────────────────────────

    @staticmethod
    def normalize_score(raw_score: float, all_scores: Optional[List[float]] = None) -> int:
        """
        Absolute mapping [-1, 1] → [0, 100]
        Calibrated for compute_score() output range (-0.5 to +0.5 typical)

        Bands:
          raw < -0.2       →  0–35   (poor fit)
          -0.2 – 0.0       → 35–50   (weak)
          0.0 – 0.1        → 50–60   (below average)
          0.1 – 0.2        → 60–72   (decent)
          0.2 – 0.4        → 72–85   (good)
          0.4 – 1.0        → 85–95   (strong)
        """
        if raw_score < -0.2:
            return round(max(0, 35 + (raw_score + 0.2) / 0.8 * 35))   # -1→0,  -0.2→35
        elif raw_score < 0.0:
            return round(35 + (raw_score + 0.2) / 0.2 * 15)            # -0.2→35, 0→50
        elif raw_score < 0.1:
            return round(50 + (raw_score / 0.1) * 10)                   # 0→50, 0.1→60
        elif raw_score < 0.2:
            return round(60 + ((raw_score - 0.1) / 0.1) * 12)          # 0.1→60, 0.2→72
        elif raw_score < 0.4:
            return round(72 + ((raw_score - 0.2) / 0.2) * 13)          # 0.2→72, 0.4→85
        else:
            return round(85 + ((raw_score - 0.4) / 0.6) * 10)          # 0.4→85, 1.0→95