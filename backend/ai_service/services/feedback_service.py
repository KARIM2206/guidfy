"""
feedback_service.py
Handles reading/writing feedback_log.jsonl with strict error tolerance.
"""
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

import numpy as np
import pandas as pd

log = logging.getLogger("feedback_service")


class FeedbackService:
    def __init__(self, log_path: Path):
        self.log_path = Path(log_path)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def append(self, event: Dict[str, Any]) -> None:
        """Append a single feedback event to the JSONL log."""
        event["timestamp"] = datetime.utcnow().isoformat()
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False) + "\n")
        log.info(
            f"feedback | user={event.get('userId')} | job={event.get('jobId')} | action={event.get('action')}"
        )

    def load(self, expected_features: List[str] = None) -> pd.DataFrame:
        """
        Load feedback_log.jsonl into a DataFrame.
        Skips corrupted lines gracefully and cleans legacy labels.
        """
        if not self.log_path.exists():
            raise FileNotFoundError(f"{self.log_path} not found. Run export first.")

        lines = [
            l.strip() for l in self.log_path.read_text(encoding="utf-8").split("\n")
            if l.strip()
        ]
        if not lines:
            raise ValueError("feedback_log.jsonl is empty")

        events = []
        for i, line in enumerate(lines, 1):
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError as e:
                log.warning(f"Skipping corrupted JSON at line {i}: {e}. Content snippet: {line[:50]}...")
                continue

        if not events:
            raise ValueError("No valid JSON records could be parsed from feedback_log.jsonl")

        df = pd.DataFrame(events)
        log.info(f"Loaded {len(df)} valid feedback events. Columns: {list(df.columns)}")

        # --- تصحيح الـ Labels وتجنب فخ القيم السالبة ---
        if "label" in df.columns:
            df["label"] = pd.to_numeric(df["label"], errors="coerce")
            # حماية الموديل: تحويل الـ -1 القديمة الخاصة بـ dismiss إلى 0 لضمان عدم وجود قيم سالبة في الـ Ranking
            df["label"] = df["label"].replace(-1, 0)
        elif "action" in df.columns:
            label_map = {"dismiss": 0, "impression": 1, "click": 2, "save": 3, "apply": 4}
            df["label"] = df["action"].map(label_map)
        else:
            df["label"] = np.nan

        # ضمان تحويل الـ Labels لقيم صحيحة موجبة بعد التنظيف
        df["label"] = df["label"].fillna(0).astype(int)

        # Coerce all expected features to numeric (NaN if missing/invalid)
        if expected_features:
            for feat in expected_features:
                if feat in df.columns:
                    df[feat] = pd.to_numeric(df[feat], errors="coerce")
                else:
                    df[feat] = np.nan

        # Rename IDs for internal consistency
        id_cols = {}
        if "userId" in df.columns:
            id_cols["userId"] = "user_id"
        if "jobId" in df.columns:
            id_cols["jobId"] = "job_id"
        if id_cols:
            df = df.rename(columns=id_cols)

        return df

    def stats(self) -> Dict[str, Any]:
        """Return feedback statistics, ignoring corrupted records."""
        if not self.log_path.exists():
            return {"total": 0, "by_action": {}, "ready_for_retrain": False}

        events = []
        with open(self.log_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        events.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue

        by_action = {}
        for e in events:
            a = e.get("action", "unknown")
            by_action[a] = by_action.get(a, 0) + 1

        return {
            "total": len(events),
            "by_action": by_action,
            "ready_for_retrain": len(events) >= 50,
        }