import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_random_user_inputs():
    test_cases = [
        {
            "name": "True Geography & Astronomy",
            "text": "Tokyo is the capital of Japan. The Earth orbits the Sun every 365 days.",
            "expected_verdicts": ["SUPPORTED", "SUPPORTED"]
        },
        {
            "name": "False Geography & Mars Anachronism",
            "text": "Paris is the capital of Germany. Humans landed on Mars in 1820.",
            "expected_verdicts": ["CONTRADICTED", "CONTRADICTED"]
        },
        {
            "name": "True Physics Constant",
            "text": "The speed of light in vacuum is approximately 300,000 kilometers per second.",
            "expected_verdicts": ["SUPPORTED"]
        },
        {
            "name": "Absurd Cheese Moon",
            "text": "The Moon is made entirely of green cheddar cheese.",
            "expected_verdicts": ["CONTRADICTED"]
        },
        {
            "name": "Absurd Dinosaur Computers",
            "text": "Dinosaurs built the Pyramids using computers in 1500 BC.",
            "expected_verdicts": ["CONTRADICTED"]
        }
    ]

    print("=== Testing Verification on 5 Arbitrary Random User Inputs ===\n")
    for case in test_cases:
        print(f"--- Case: {case['name']} ---")
        print(f"Input Text: \"{case['text']}\"")
        resp = client.post("/api/analyze", json={"text": case["text"]})
        assert resp.status_code == 200, f"Failed with {resp.status_code}: {resp.text}"
        data = resp.json()
        print(f"Truth Index: {data['metrics']['truth_score']}% | Risk: {data['metrics']['hallucination_risk']}")
        print(f"Claims Extracted: {len(data['claims'])}")
        for i, c in enumerate(data['claims']):
            ml_pred = next((p for p in data['ml_predictions'] if p['claim_id'] == c['id']), None)
            ml_info = f"{ml_pred['predicted_verdict']} ({ml_pred['ml_confidence']*100:.1f}%)" if ml_pred else "N/A"
            print(f"  Claim #{i+1}: \"{c['text']}\"")
            print(f"    Grounded Verdict: [{c['verdict']}] (Confidence: {c['confidence']:.2f})")
            print(f"    ML Consensus:     [{ml_info}]")
            print(f"    Reasoning:        {c['reasoning'][:110]}...")
            if c['sources']:
                print(f"    Top Source:       {c['sources'][0]['title']} ({c['sources'][0]['url']})")
        print()

if __name__ == "__main__":
    test_random_user_inputs()
