import os
import json
import argparse
from typing import Dict, Any, List
from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from app.ml.dataset import FactDataset
from app.ml.model import TruthLensMLClassifier


class MLTrainingHarness:
    """Executes multi-stage training cycles and produces evaluation metrics."""

    def __init__(self, output_dir: str = "backend/app/ml"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def run_training_cycles(
        self,
        samples: List[Dict[str, Any]],
        cycles: int = 3
    ) -> Dict[str, Any]:
        """
        Executes N training cycles (minimum 3 cycles) over the facts corpus.
        Records progression, validation metrics, and persists the final model artifact.
        """
        if len(samples) < 10:
            raise ValueError(f"Insufficient samples for training. Found {len(samples)}, need at least 10.")

        # Extract training features (using combined claim + evidence context when available for high accuracy)
        texts = [s.get("combined") or s["text"] for s in samples]
        labels = [s["label"] for s in samples]

        label_counts = Counter(labels)
        can_stratify = len(label_counts) > 1 and min(label_counts.values()) >= 2

        # 80/20 train/test split
        X_train, X_val, y_train, y_val = train_test_split(
            texts, labels, test_size=0.20, random_state=42, stratify=labels if can_stratify else None
        )

        history = []
        best_f1 = -1.0
        best_pipeline = None

        print(f"\n=================================================================")
        print(f" TruthLens ML: Ingesting {len(samples)} Facts across 3 Classes")
        print(f" Train Split: {len(X_train)} | Validation Split: {len(X_val)}")
        print(f" Class Breakdown: {dict(label_counts)}")
        print(f"=================================================================\n")

        # 3 Progressive training cycles with modern feature engineering
        cycle_configs = [
            {
                "cycle": 1,
                "name": "FeatureUnion (Word 1-2 + Char 3-5) + Logistic Regression (C=3.0)",
                "type": "logreg",
                "word_ngrams": (1, 2),
                "word_features": 30000,
                "char_ngrams": (3, 5),
                "char_features": 25000,
                "C": 3.0
            },
            {
                "cycle": 2,
                "name": "Expanded Word (1-3) + Char (3-5) FeatureUnion + Logistic Regression (C=5.0)",
                "type": "logreg",
                "word_ngrams": (1, 3),
                "word_features": 40000,
                "char_ngrams": (3, 5),
                "char_features": 35000,
                "C": 5.0
            },
            {
                "cycle": 3,
                "name": "Dual Word+Char FeatureUnion + Calibrated LinearSVC (C=1.0)",
                "type": "linearsvc",
                "word_ngrams": (1, 3),
                "word_features": 50000,
                "char_ngrams": (3, 5),
                "char_features": 40000,
                "C": 1.0
            }
        ]

        for i in range(cycles):
            cfg = cycle_configs[i % len(cycle_configs)]
            cycle_num = i + 1
            print(f">>> Running Training Cycle {cycle_num}/{cycles}: {cfg['name']}...")

            # Construct feature union
            feats = FeatureUnion([
                ("word", TfidfVectorizer(
                    ngram_range=cfg["word_ngrams"],
                    max_features=cfg["word_features"],
                    sublinear_tf=True,
                    strip_accents="unicode"
                )),
                ("char", TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=cfg["char_ngrams"],
                    max_features=cfg["char_features"],
                    sublinear_tf=True
                ))
            ])

            if cfg["type"] == "linearsvc":
                counts = Counter(y_train)
                min_class_count = min(counts.values()) if counts else 1
                if min_class_count < 2:
                    clf = LogisticRegression(C=cfg["C"], max_iter=1500, solver="lbfgs")
                else:
                    cv_folds = max(2, min(5, min_class_count))
                    clf = CalibratedClassifierCV(
                        LinearSVC(C=cfg["C"], max_iter=3000, random_state=42),
                        cv=cv_folds
                    )
            else:
                clf = LogisticRegression(
                    C=cfg["C"],
                    max_iter=1500,
                    solver="lbfgs",
                    class_weight="balanced"
                )

            pipeline = Pipeline([
                ("feats", feats),
                ("clf", clf)
            ])

            # Train on X_train
            pipeline.fit(X_train, y_train)

            # Evaluate on X_val
            y_pred = pipeline.predict(X_val)
            acc = accuracy_score(y_val, y_pred)
            f1 = f1_score(y_val, y_pred, average="macro", zero_division=0)
            cm = confusion_matrix(y_val, y_pred, labels=["CONTRADICTED", "SUPPORTED", "UNVERIFIED"]).tolist()
            report = classification_report(y_val, y_pred, output_dict=True, zero_division=0)

            # Evaluate training set accuracy
            y_train_pred = pipeline.predict(X_train[:min(3000, len(X_train))])
            train_acc = accuracy_score(y_train[:min(3000, len(y_train))], y_train_pred)

            cycle_metrics = {
                "cycle": cycle_num,
                "model_name": cfg["name"],
                "train_samples": len(X_train),
                "val_samples": len(X_val),
                "train_accuracy": round(train_acc, 4),
                "accuracy": round(acc, 4),
                "f1_macro": round(f1, 4),
                "classification_report": report,
                "confusion_matrix": {
                    "labels": ["CONTRADICTED", "SUPPORTED", "UNVERIFIED"],
                    "matrix": cm
                }
            }
            history.append(cycle_metrics)

            print(f"    Cycle {cycle_num} Complete: Accuracy = {acc:.2%}, F1-Macro = {f1:.4f}")
            print(f"    Per-Class Precision: Supported={report.get('SUPPORTED', {}).get('precision', 0):.2%}, "
                  f"Contradicted={report.get('CONTRADICTED', {}).get('precision', 0):.2%}, "
                  f"Unverified={report.get('UNVERIFIED', {}).get('precision', 0):.2%}\n")

            if f1 > best_f1 or best_pipeline is None:
                best_f1 = f1
                best_pipeline = pipeline

        # Package best classifier
        best_classifier = TruthLensMLClassifier()
        best_classifier.pipeline = best_pipeline
        best_classifier.is_trained = True
        best_classifier.classes = list(best_pipeline.classes_)

        # Save model artifact in output_dir and root
        import joblib
        saved_path_backend = os.path.join(self.output_dir, TruthLensMLClassifier.MODEL_FILENAME)
        joblib.dump(best_pipeline, saved_path_backend)
        try:
            joblib.dump(best_pipeline, TruthLensMLClassifier.MODEL_FILENAME)
        except Exception:
            pass

        print(f"[TruthLens ML] Best model artifact saved to: {saved_path_backend}")

        best_acc = max(h["accuracy"] for h in history)
        # Persist metrics summary
        metrics_summary = {
            "status": "trained",
            "total_samples": len(samples),
            "total_facts_ingested": len(samples),
            "cycles_completed": cycles,
            "best_f1_macro": round(best_f1, 4),
            "best_accuracy": round(best_acc, 4),
            "val_accuracy": round(best_acc, 4),
            "val_f1_macro": round(best_f1, 4),
            "cycle_history": history
        }

        for dest_dir in [self.output_dir, "."]:
            m_path = os.path.join(dest_dir, TruthLensMLClassifier.METRICS_FILENAME)
            with open(m_path, "w", encoding="utf-8") as f:
                json.dump(metrics_summary, f, indent=2)

        print(f"[TruthLens ML] Metrics summary saved to: {os.path.join(self.output_dir, TruthLensMLClassifier.METRICS_FILENAME)}")
        return metrics_summary


def run_training_on_directory(dataset_dir: str, cycles: int = 3) -> Dict[str, Any]:
    samples = FactDataset.load_from_directory(dataset_dir)
    harness = MLTrainingHarness(output_dir="backend/app/ml")
    return harness.run_training_cycles(samples, cycles=cycles)


def main():
    parser = argparse.ArgumentParser(description="Train TruthLens Factuality Classifier")
    parser.add_argument("--dataset-dir", type=str, default=r"D:\TRUTHLENS\ML MODEL DATASET")
    parser.add_argument("--cycles", type=int, default=3, help="Number of training cycles (default: 3)")
    args = parser.parse_args()

    run_training_on_directory(args.dataset_dir, cycles=args.cycles)


if __name__ == "__main__":
    main()
