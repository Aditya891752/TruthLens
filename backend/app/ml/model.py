import os
import joblib
from typing import List, Tuple, Dict, Any, Optional
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV


class TruthLensMLClassifier:
    """
    Machine Learning Factuality Classifier.
    Predicts probability of factual support vs hallucination/contradiction for atomic claims.
    """

    MODEL_FILENAME = "trained_model.joblib"
    METRICS_FILENAME = "training_metrics.json"

    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self.is_trained: bool = False
        self.classes: List[str] = ["CONTRADICTED", "SUPPORTED", "UNVERIFIED"]

    def build_pipeline(self) -> Pipeline:
        """Constructs the feature extraction and classification pipeline."""
        return Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=25000,
                sublinear_tf=True,
                strip_accents="unicode"
            )),
            ("clf", LogisticRegression(
                C=2.5,
                max_iter=1500,
                solver="lbfgs",
                class_weight="balanced"
            ))
        ])

    def fit(self, texts: List[str], labels: List[str]) -> "TruthLensMLClassifier":
        """Trains the model on a labeled corpus of facts."""
        self.pipeline = self.build_pipeline()
        self.pipeline.fit(texts, labels)
        self.is_trained = True
        self.classes = list(self.pipeline.classes_)
        return self

    def predict(self, claim_text: str) -> Tuple[str, float]:
        """
        Predicts verdict and probability confidence for a given claim.
        Returns: (predicted_label, confidence_score)
        """
        if not self.is_trained or not self.pipeline:
            return ("UNVERIFIED", 0.50)

        probs = self.pipeline.predict_proba([claim_text])[0]
        max_idx = int(probs.argmax())
        label = self.classes[max_idx]
        confidence = float(probs[max_idx])
        return (label, round(confidence, 4))

    def save(self, directory: str = ".") -> str:
        """Saves serialized model pipeline to disk."""
        if not self.pipeline or not self.is_trained:
            raise RuntimeError("Cannot save an untrained model.")
        
        filepath = os.path.join(directory, self.MODEL_FILENAME)
        joblib.dump(self.pipeline, filepath)
        return filepath

    def load(self, directory: str = ".") -> bool:
        """Loads serialized model pipeline from disk if available."""
        filepath = os.path.join(directory, self.MODEL_FILENAME)
        if os.path.exists(filepath):
            try:
                self.pipeline = joblib.load(filepath)
                self.is_trained = True
                self.classes = list(self.pipeline.classes_)
                return True
            except Exception as e:
                print(f"[TruthLensMLClassifier] Failed to load model: {e}")
        return False
