import os
import json
import argparse
from typing import Dict, Any, List
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score
from app.ml.dataset import FactDataset
from app.ml.model import TruthLensMLClassifier


class MLTrainingHarness:
    """Executes multi-stage training cycles and produces evaluation metrics."""

    def __init__(self, output_dir: str = "."):
        self.output_dir = output_dir

    def run_training_cycles(
        self,
        samples: List[Dict[str, Any]],
        cycles: int = 3
    ) -> Dict[str, Any]:
        """
        Executes N training cycles (minimum 3 cycles requested) over the facts corpus.
        Records progression, validation metrics, and persists the final model artifact.
        """
        if len(samples) < 10:
            raise ValueError(f"Insufficient samples for training. Found {len(samples)}, need at least 10.")

        texts = [s["text"] for s in samples]
        labels = [s["label"] for s in samples]

        # Only stratify if all classes have at least 2 samples
        from collections import Counter
        label_counts = Counter(labels)
        can_stratify = len(label_counts) > 1 and min(label_counts.values()) >= 2

        X_train, X_val, y_train, y_val = train_test_split(
            texts, labels, test_size=0.20, random_state=42, stratify=labels if can_stratify else None
        )

        history = []
        best_f1 = -1.0
        best_model: TruthLensMLClassifier = None

        print(f"\n[TruthLens ML] Starting {cycles} training cycles across {len(samples)} facts...")

        for cycle_idx in range(1, cycles + 1):
            print(f"\n--- Training Cycle {cycle_idx}/{cycles} ---")
            classifier = TruthLensMLClassifier()
            
            # Train pipeline
            classifier.fit(X_train, y_train)

            # Evaluate on validation split
            y_pred = [classifier.predict(t)[0] for t in X_val]
            acc = accuracy_score(y_val, y_pred)
            f1 = f1_score(y_val, y_pred, average="macro", zero_division=0)
            report = classification_report(y_val, y_pred, output_dict=True, zero_division=0)

            cycle_metrics = {
                "cycle": cycle_idx,
                "train_samples": len(X_train),
                "val_samples": len(X_val),
                "accuracy": round(float(acc), 4),
                "f1_macro": round(float(f1), 4),
                "classification_report": report
            }
            history.append(cycle_metrics)
            print(f"Cycle {cycle_idx} Results: Accuracy={acc:.2%}, F1-Macro={f1:.4f}")

            if f1 > best_f1 or best_model is None:
                best_f1 = f1
                best_model = classifier

        # Persist best model
        saved_model_path = best_model.save(self.output_dir)
        print(f"\n[TruthLens ML] Best model artifact saved to: {saved_model_path}")

        # Persist metrics
        metrics_summary = {
            "total_facts_ingested": len(samples),
            "cycles_completed": cycles,
            "best_f1_macro": round(best_f1, 4),
            "cycle_history": history
        }
        
        metrics_path = os.path.join(self.output_dir, TruthLensMLClassifier.METRICS_FILENAME)
        with open(metrics_path, "w", encoding="utf-8") as f:
            json.dump(metrics_summary, f, indent=2)

        print(f"[TruthLens ML] Metrics summary saved to: {metrics_path}")
        return metrics_summary


def main():
    parser = argparse.ArgumentParser(description="Train TruthLens Factuality Classifier")
    parser.add_argument("--dataset", type=str, required=True, help="Path to JSON dataset of facts")
    parser.add_argument("--cycles", type=int, default=3, help="Number of training cycles (default: 3)")
    parser.add_argument("--output-dir", type=str, default=".", help="Directory to save model artifact")
    args = parser.parse_args()

    samples = FactDataset.load_from_json(args.dataset)
    harness = MLTrainingHarness(output_dir=args.output_dir)
    harness.run_training_cycles(samples, cycles=args.cycles)


if __name__ == "__main__":
    main()
