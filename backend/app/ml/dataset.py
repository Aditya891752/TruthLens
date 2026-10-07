import json
import os
from typing import List, Dict, Any, Tuple
import numpy as np


class FactDataset:
    """Handles ingestion, validation, and batching of fact-checking training datasets."""

    VALID_LABELS = {"SUPPORTED", "CONTRADICTED", "UNVERIFIED"}

    @classmethod
    def load_from_json(cls, filepath: str) -> List[Dict[str, Any]]:
        """Load facts from a JSON file. Expected format: [{"text": "...", "label": "SUPPORTED"}]"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset file not found at: {filepath}")

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError("Dataset JSON must contain an array of fact objects.")

        return cls.validate_samples(data)

    @classmethod
    def validate_samples(cls, samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validates schema, text length, and label validity."""
        valid_samples = []
        for i, s in enumerate(samples):
            text = s.get("text") or s.get("claim")
            label = (s.get("label") or s.get("verdict") or "").upper().strip()

            if not text or not isinstance(text, str) or len(text.strip()) < 5:
                continue

            if label not in cls.VALID_LABELS:
                # Map common label synonyms
                if label in {"TRUE", "FACT", "SUPPORT", "VERIFIED"}:
                    label = "SUPPORTED"
                elif label in {"FALSE", "FAKE", "CONTRADICT", "REFUTED", "HALLUCINATION"}:
                    label = "CONTRADICTED"
                else:
                    label = "UNVERIFIED"

            valid_samples.append({
                "text": text.strip(),
                "label": label,
                "metadata": s.get("metadata", {})
            })

        return valid_samples

    @classmethod
    def get_summary(cls, samples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Returns distribution and statistics of dataset samples."""
        total = len(samples)
        counts = {"SUPPORTED": 0, "CONTRADICTED": 0, "UNVERIFIED": 0}
        for s in samples:
            counts[s["label"]] = counts.get(s["label"], 0) + 1

        return {
            "total_facts": total,
            "label_distribution": counts,
            "is_sufficient_for_training": total >= 100,
            "target_threshold": 6000
        }
