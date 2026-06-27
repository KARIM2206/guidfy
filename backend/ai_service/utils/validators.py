"""
validators.py
Schema and consistency validation for the ML pipeline.
"""
import logging
from typing import List

import numpy as np
import pandas as pd

log = logging.getLogger("validators")


class ValidationError(Exception):
    pass


def validate_feature_schema(df: pd.DataFrame, expected_features: List[str]) -> None:
    """
    Ensure DataFrame contains exactly the expected features (order-agnostic).
    Raises ValidationError on mismatch.
    """
    missing = set(expected_features) - set(df.columns)
    extra = set(df.columns) - set(expected_features)

    if missing:
        raise ValidationError(f"Missing features in data: {sorted(missing)}")
    if extra:
        log.warning(f"Extra features in data (will be ignored): {sorted(extra)}")

    # Check for all-NaN columns
    all_nan = [c for c in expected_features if df[c].isna().all()]
    if all_nan:
        log.warning(f"All-NaN features: {all_nan}")

    # Check for zero-variance columns
    zero_var = []
    for c in expected_features:
        if df[c].notna().sum() > 1:
            if df[c].dropna().nunique() <= 1:
                zero_var.append(c)
    if zero_var:
        log.warning(f"Zero-variance features: {zero_var}")


def validate_no_duplicate_features(df: pd.DataFrame) -> None:
    """Detect duplicate column names."""
    dups = df.columns[df.columns.duplicated()].tolist()
    if dups:
        raise ValidationError(f"Duplicate columns detected: {dups}")


def validate_model_meta(meta: dict, expected_features: List[str]) -> None:
    """Validate model_meta.json against expected feature contract."""
    meta_features = meta.get("features", [])
    if set(meta_features) != set(expected_features):
        raise ValidationError(
            f"model_meta features mismatch. Expected {expected_features}, got {meta_features}"
        )
    if meta.get("n_features") != len(expected_features):
        log.warning(
            f"model_meta n_features ({meta.get('n_features')}) != expected ({len(expected_features)})"
        )