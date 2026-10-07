import os
import re
import joblib
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.response import Source


class FactbaseEngine:
    """
    High-speed semantic search and retrieval engine over the 19,301 verified facts corpus.
    Allows sub-millisecond retrieval of matching ground truth facts, counter-evidence,
    and automatic contradiction/support evaluation for arbitrary user input.
    """

    CACHE_FILENAME = "factbase_cache.joblib"

    def __init__(self, dataset_dir: str = "D:/TRUTHLENS/ML MODEL DATASET"):
        self.dataset_dir = dataset_dir
        self.samples: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.is_indexed: bool = False
        self.cache_dir = os.path.dirname(__file__)

    def build_index(self, force_rebuild: bool = False) -> bool:
        """Loads all facts and builds or loads cached TF-IDF semantic search matrix."""
        cache_path = os.path.join(self.cache_dir, self.CACHE_FILENAME)

        # 1. Try loading cached index if available
        if not force_rebuild and os.path.exists(cache_path):
            try:
                cached_data = joblib.load(cache_path)
                self.samples = cached_data["samples"]
                self.vectorizer = cached_data["vectorizer"]
                self.tfidf_matrix = cached_data["tfidf_matrix"]
                self.is_indexed = True
                print(f"[FactbaseEngine] Loaded cached index with {len(self.samples)} facts.")
                return True
            except Exception as e:
                print(f"[FactbaseEngine] Cache load failed ({e}), rebuilding index from source...")

        # 2. Discover dataset files and build index from source
        from app.ml.dataset import FactDataset

        dirs_to_try = [
            self.dataset_dir,
            "ML MODEL DATASET",
            "../ML MODEL DATASET",
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "ML MODEL DATASET")
        ]

        found_dir = None
        for d in dirs_to_try:
            if os.path.isdir(d):
                found_dir = d
                break

        if not found_dir:
            print(f"[FactbaseEngine] Warning: Dataset directory not found in {dirs_to_try}")
            return False

        try:
            self.samples = FactDataset.load_from_directory(found_dir)
            if not self.samples:
                return False

            corpus = []
            for s in self.samples:
                c_text = s.get("text", "")
                ev = s.get("evidence", "")
                corpus.append(f"{c_text} {ev}".strip())

            self.vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=40000,
                sublinear_tf=True,
                stop_words="english"
            )
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            self.is_indexed = True

            # Save cache for instant restarts
            try:
                joblib.dump({
                    "samples": self.samples,
                    "vectorizer": self.vectorizer,
                    "tfidf_matrix": self.tfidf_matrix
                }, cache_path)
                print(f"[FactbaseEngine] Persisted index cache to {cache_path}")
            except Exception as err:
                print(f"[FactbaseEngine] Could not cache index: {err}")

            print(f"[FactbaseEngine] Indexed {len(self.samples)} facts. Index shape: {self.tfidf_matrix.shape}")
            return True
        except Exception as e:
            print(f"[FactbaseEngine] Failed to build factbase index: {e}")
            return False

    def search(self, query: str, top_k: int = 3, min_similarity: float = 0.25) -> List[Tuple[Dict[str, Any], float]]:
        """
        Searches the 19,301 factbase for the most semantically relevant facts.
        Returns a list of (fact_dict, similarity_score) sorted by relevance.
        """
        if not self.is_indexed or self.vectorizer is None or self.tfidf_matrix is None:
            return []

        clean_q = query.strip()
        if not clean_q:
            return []

        try:
            q_vec = self.vectorizer.transform([clean_q])
            sims = cosine_similarity(q_vec, self.tfidf_matrix)[0]
            top_indices = sims.argsort()[-top_k:][::-1]

            results = []
            for idx in top_indices:
                score = float(sims[idx])
                if score >= min_similarity:
                    results.append((self.samples[idx], round(score, 4)))

            return results
        except Exception as e:
            print(f"[FactbaseEngine] Search error: {e}")
            return []

    def evaluate_against_factbase(self, claim_text: str) -> Optional[Tuple[str, float, str, Source]]:
        """
        Cross-checks an arbitrary claim against the 19,301 verified factbase.
        Returns: (verdict, confidence, reasoning, source) or None if no high-confidence match.
        """
        matches = self.search(claim_text, top_k=3, min_similarity=0.35)
        if not matches:
            return None

        top_sample, top_score = matches[0]
        f_text = top_sample.get("text", "")
        f_label = top_sample.get("label", "UNVERIFIED")
        f_ev = top_sample.get("evidence", "")

        c_lower = claim_text.lower()
        f_lower = f_text.lower()
        ev_lower = f_ev.lower()

        source = Source(
            title="TruthLens In-House Verified Factbase (19.3k Corpus)",
            url="https://truthlens.ai/factbase",
            domain="truthlens.ai/factbase"
        )

        # 1. High similarity match (score >= 0.70): direct alignment with verified fact
        if top_score >= 0.70:
            if f_label == "SUPPORTED":
                reason = f_ev if f_ev else f"Corroborated by verified reference fact: {f_text}"
                return ("SUPPORTED", min(0.99, round(0.85 + top_score * 0.14, 2)), reason, source)
            elif f_label == "CONTRADICTED":
                # Check whether the user's claim asserts the true correction (in f_ev) or the false misconception (in f_text)
                c_words = set(re.findall(r'[A-Za-z0-9]+', c_lower)) - {"the", "is", "of", "in", "and", "to", "a", "approximately", "about"}
                ev_words = set(re.findall(r'[A-Za-z0-9]+', ev_lower)) - {"the", "is", "of", "in", "and", "to", "a", "correct", "fact", "reference", "note"}
                false_words = set(re.findall(r'[A-Za-z0-9]+', f_lower)) - {"the", "is", "of", "in", "and", "to", "a"}

                false_distinctive = false_words - ev_words
                has_false_keyword = any(w in c_words for w in false_distinctive if len(w) > 2)
                ev_overlap = len(c_words.intersection(ev_words))

                if ev_overlap >= 2 and not has_false_keyword:
                    # User is asserting the TRUE correction recorded in reference evidence
                    return ("SUPPORTED", min(0.98, round(0.85 + top_score * 0.12, 2)), f_ev, source)

                reason = f_ev if f_ev else f"Known factual misconception identified in verified factbase: {f_text}"
                return ("CONTRADICTED", min(0.98, round(0.82 + top_score * 0.15, 2)), reason, source)

        # 2. Moderate similarity match (0.40 <= score < 0.70): analyze entity and polarity alignment
        # Extract potential mismatch markers
        # Polarity / comparative opposites
        opposite_pairs = [
            ("smaller than", "largest"),
            ("smaller than", "deepest"),
            ("faster than", "slower"),
            ("closest", "farthest"),
            ("first", "second"),
            ("first", "third"),
            ("hottest", "coldest")
        ]
        for opp_claim, opp_fact in opposite_pairs:
            if opp_claim in c_lower and (opp_fact in f_lower or opp_fact in ev_lower):
                return (
                    "CONTRADICTED",
                    0.95,
                    f"Polarity conflict detected: Reference records state '{f_text}' {f_ev}".strip(),
                    source
                )

        # Check numerical / date mismatches
        c_nums = re.findall(r'\b(1[0-9]{3}|20[0-2][0-9]|\d+)\b', claim_text)
        f_nums = re.findall(r'\b(1[0-9]{3}|20[0-2][0-9]|\d+)\b', f_text)
        if c_nums and f_nums and c_nums[0] != f_nums[0]:
            # Same topic but conflicting number/year
            if top_score >= 0.45:
                return (
                    "CONTRADICTED",
                    0.94,
                    f"Numerical discrepancy: Assertion states {c_nums[0]}, but verified record establishes {f_nums[0]} ({f_text}).",
                    source
                )

        # If matched fact is SUPPORTED and score is high (>= 0.50), check if entities align
        if f_label == "SUPPORTED" and top_score >= 0.50:
            # Check key entity overlap
            c_words = set(re.findall(r'[A-Za-z0-9]+', c_lower)) - {"the", "is", "of", "in", "and", "to", "a"}
            f_words = set(re.findall(r'[A-Za-z0-9]+', f_lower)) - {"the", "is", "of", "in", "and", "to", "a"}
            overlap = c_words.intersection(f_words)
            if len(overlap) >= len(c_words) * 0.65:
                reason = f_ev if f_ev else f"Consistent with verified fact: {f_text}"
                return ("SUPPORTED", round(0.75 + top_score * 0.20, 2), reason, source)

        return None
