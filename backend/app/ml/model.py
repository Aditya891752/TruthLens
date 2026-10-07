import os
import joblib
from typing import List, Tuple, Dict, Any, Optional
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.svm import LinearSVC


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
        """Constructs the high-accuracy feature extraction and classification pipeline."""
        feats = FeatureUnion([
            ("word", TfidfVectorizer(
                ngram_range=(1, 3),
                max_features=50000,
                sublinear_tf=True,
                strip_accents="unicode"
            )),
            ("char", TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                max_features=40000,
                sublinear_tf=True
            ))
        ])

        return Pipeline([
            ("feats", feats),
            ("clf", CalibratedClassifierCV(
                LinearSVC(C=1.0, max_iter=3000, random_state=42)
            ))
        ])

    def fit(self, texts: List[str], labels: List[str]) -> "TruthLensMLClassifier":
        """Trains the model on a labeled corpus of facts."""
        self.pipeline = self.build_pipeline()
        self.pipeline.fit(texts, labels)
        self.is_trained = True
        self.classes = list(self.pipeline.classes_)
        return self

    def predict(self, claim_text: str, evidence_context: Optional[str] = None) -> Tuple[str, float]:
        """
        Predicts verdict and probability confidence for a given claim.
        Optionally uses evidence context for cross-checked NLI verification.
        Returns: (predicted_label, confidence_score)
        """
        if not self.is_trained or not self.pipeline:
            return ("UNVERIFIED", 0.50)

        input_text = f"{claim_text} [EVIDENCE] {evidence_context}" if evidence_context else claim_text
        probs = self.pipeline.predict_proba([input_text])[0]
        max_idx = int(probs.argmax())
        label = str(self.classes[max_idx])
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
