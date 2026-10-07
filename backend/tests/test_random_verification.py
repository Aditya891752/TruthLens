import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.ml.factbase_engine import FactbaseEngine
from app.models.response import Source

def run_tests():
    engine = FactbaseEngine()
    engine.build_index()

    test_claims = [
        ("Tokyo is the capital of Japan.", "SUPPORTED"),
        ("Paris is the capital of Germany.", "CONTRADICTED"),
        ("The speed of light in vacuum is approximately 300,000 kilometers per second.", "SUPPORTED"),
        ("Sound travels faster than light in air.", "CONTRADICTED"),
        ("Apollo 11 landed humans on the Moon in 1969.", "SUPPORTED"),
        ("Humans landed on Mars in 1969.", "CONTRADICTED"),
        ("Water boils at 100 degrees Celsius at standard atmospheric pressure.", "SUPPORTED"),
        ("Mercury's chemical symbol is Cl.", "CONTRADICTED"),
        ("Mount Everest is the highest mountain above sea level.", "SUPPORTED"),
        ("The Pacific Ocean is smaller than the Black Sea.", "CONTRADICTED"),
        ("William Shakespeare wrote Hamlet.", "SUPPORTED"),
        ("Dinosaurs built computers in 1500 BC.", "CONTRADICTED")
    ]

    print("=== Testing Factbase Search on 12 Random Claims ===")
    for claim, expected in test_claims:
        res = engine.search(claim, top_k=2, min_similarity=0.25)
        if res:
            top_sample, score = res[0]
            print(f"\nClaim: {claim}")
            print(f"  Expected: {expected} | Top Match Score: {score:.3f}")
            print(f"  Matched Fact: [{top_sample.get('label')}] {top_sample.get('text')}")
            print(f"  Evidence: {top_sample.get('evidence', '')[:90]}")
        else:
            print(f"\nClaim: {claim} -> No direct match in factbase (<0.25 sim)")

if __name__ == "__main__":
    run_tests()
