import json
import os
import csv
from typing import List, Dict, Any, Tuple
import numpy as np


class FactDataset:
    """Handles ingestion, validation, and batching of fact-checking training datasets."""

    VALID_LABELS = {"SUPPORTED", "CONTRADICTED", "UNVERIFIED"}

    @classmethod
    def load_from_csv(cls, filepath: str) -> List[Dict[str, Any]]:
        """Load facts from a CSV file with columns: claim/text, label, evidence, reasoning."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"CSV file not found at: {filepath}")

        samples = []
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                samples.append(row)

        return cls.validate_samples(samples)

    @classmethod
    def load_from_directory(cls, dirpath: str) -> List[Dict[str, Any]]:
        """Discovers and merges all CSV/JSON facts from a directory."""
        if not os.path.isdir(dirpath):
            raise NotADirectoryError(f"Directory not found: {dirpath}")

        all_samples = []
        for fname in os.listdir(dirpath):
            fpath = os.path.join(dirpath, fname)
            if fname.endswith(".csv") or ".csv" in fname:
                try:
                    loaded = cls.load_from_csv(fpath)
                    print(f"[FactDataset] Loaded {len(loaded)} facts from {fname}")
                    all_samples.extend(loaded)
                except Exception as e:
                    print(f"[FactDataset] Warning: Could not read {fname}: {e}")
            elif fname.endswith(".json") or fname.endswith(".jsonl") or fname == "40585 (1)":
                try:
                    loaded = cls.load_from_json(fpath)
                    print(f"[FactDataset] Loaded {len(loaded)} facts from {fname}")
                    all_samples.extend(loaded)
                except Exception as e:
                    print(f"[FactDataset] Warning: Could not read {fname}: {e}")

        return all_samples

    @classmethod
    def load_from_json(cls, filepath: str) -> List[Dict[str, Any]]:
        """Load facts from a JSON or JSONL file."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset file not found at: {filepath}")

        data = []
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().strip()
            if content.startswith("["):
                data = json.loads(content)
            else:
                for line in content.splitlines():
                    if line.strip():
                        try:
                            data.append(json.loads(line))
                        except Exception:
                            pass

        return cls.validate_samples(data)

    @classmethod
    def validate_samples(cls, samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validates schema, text length, and label validity."""
        valid_samples = []
        for i, s in enumerate(samples):
            text = s.get("text") or s.get("claim")
            evidence = s.get("evidence") or ""
            label = (s.get("label") or s.get("verdict") or "").upper().strip()

            if not text or not isinstance(text, str) or len(text.strip()) < 5:
                continue

            if label not in cls.VALID_LABELS:
                if label in {"TRUE", "FACT", "SUPPORT", "VERIFIED", "SUPPORTED"}:
                    label = "SUPPORTED"
                elif label in {"FALSE", "FAKE", "CONTRADICT", "REFUTED", "HALLUCINATION", "UNSUPPORTED"}:
                    label = "CONTRADICTED"
                else:
                    label = "UNVERIFIED"

            valid_samples.append({
                "text": text.strip(),
                "evidence": evidence.strip(),
                "combined": f"{text.strip()} [EVIDENCE] {evidence.strip()}" if evidence.strip() else text.strip(),
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
            l = s.get("label", "UNVERIFIED")
            counts[l] = counts.get(l, 0) + 1

        return {
            "total_facts": total,
            "label_distribution": counts,
            "is_sufficient_for_training": total >= 6000,
            "target_threshold": 10800
        }
