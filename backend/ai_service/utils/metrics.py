"""
metrics.py
Ranking metrics: NDCG, MAP, MRR.
"""
import numpy as np
from sklearn.metrics import ndcg_score as sklearn_ndcg


def ndcg_score(y_true: np.ndarray, y_score: np.ndarray, k: int = 10) -> float:
    """Wrapper around sklearn NDCG with safety checks."""
    if len(y_true) < 2 or np.all(y_true == y_true[0]):
        return 0.0
    try:
        return float(sklearn_ndcg([y_true], [y_score], k=k))
    except Exception:
        return 0.0


def map_score(y_true: np.ndarray, y_score: np.ndarray, k: int = 10) -> float:
    """
    Mean Average Precision @ k.
    y_true: relevance labels (higher = more relevant)
    y_score: predicted scores (higher = better predicted)
    """
    if len(y_true) == 0:
        return 0.0
    order = np.argsort(y_score)[::-1][:k]
    y_true_sorted = np.take(y_true, order)

    # Binary relevance: treat positive labels as relevant
    relevant = (y_true_sorted > 0).astype(int)
    if relevant.sum() == 0:
        return 0.0

    precisions = []
    n_relevant_so_far = 0
    for i, rel in enumerate(relevant, start=1):
        if rel:
            n_relevant_so_far += 1
            precisions.append(n_relevant_so_far / i)

    return float(np.mean(precisions)) if precisions else 0.0


def mrr_score(y_true: np.ndarray, y_score: np.ndarray, k: int = 10) -> float:
    """
    Mean Reciprocal Rank @ k.
    Returns 1 / rank_of_first_relevant_item.
    """
    if len(y_true) == 0:
        return 0.0
    order = np.argsort(y_score)[::-1][:k]
    y_true_sorted = np.take(y_true, order)

    relevant = (y_true_sorted > 0).astype(int)
    for i, rel in enumerate(relevant, start=1):
        if rel:
            return 1.0 / i
    return 0.0
