import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.ml.factbase_engine import FactbaseEngine

def test_engine():
    engine = FactbaseEngine()
    ok = engine.build_index()
    print("Index built:", ok)
    if ok:
        queries = [
            "Mercury symbol element",
            "Tunisia capital Tunis",
            "Apollo 11 moon landing Armstrong 1969",
            "Speed of light in vacuum constant"
        ]
        for q in queries:
            res = engine.search(q, top_k=2)
            print(f"\n--- Query: {q} ---")
            for sample, score in res:
                label = sample.get("label", "UNVERIFIED")
                text = sample.get("text", "")
                ev = sample.get("evidence", "")
                print(f"  Match ({score:.3f}) [{label}]: {text}")
                if ev:
                    print(f"    Evidence: {ev[:100]}")

if __name__ == "__main__":
    test_engine()
