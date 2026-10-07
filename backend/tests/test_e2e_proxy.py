import urllib.request
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_tests():
    print("--- 1. Testing Frontend HTML ---")
    req_html = urllib.request.urlopen("http://localhost:5173/")
    html = req_html.read().decode("utf-8")
    assert "<title>TruthLens" in html
    print("Frontend HTML loaded successfully.")

    print("\n--- 2. Testing Proxied Health Endpoint ---")
    req_health = urllib.request.urlopen("http://localhost:5173/api/health")
    health = json.loads(req_health.read().decode("utf-8"))
    print("Health Status:", health)
    assert health["status"] == "healthy"
    assert health["ml_model_loaded"] is True

    print("\n--- 3. Testing Proxied Presets Endpoint ---")
    req_presets = urllib.request.urlopen("http://localhost:5173/api/presets")
    presets = json.loads(req_presets.read().decode("utf-8"))
    print(f"Loaded {len(presets)} presets:")
    for p in presets:
        print(f"  - {p['id']}: {p['title']}")
    assert len(presets) == 3

    print("\n--- 4. Testing End-to-End Analysis via Vite Proxy ---")
    test_text = presets[0]["text"]
    print("Analyzing Text:", test_text)
    payload = json.dumps({"text": test_text}).encode("utf-8")
    req_analyze = urllib.request.Request(
        "http://localhost:5173/api/analyze",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    res_analyze = urllib.request.urlopen(req_analyze)
    report = json.loads(res_analyze.read().decode("utf-8"))

    print(f"\nReport ID: {report['id']}")
    print(f"Truth Index: {report['metrics']['truth_score']}% | Hallucination Risk: {report['metrics']['hallucination_risk']}")
    print(f"Claims Extracted: {report['metrics']['total_claims']}")
    for c in report["claims"]:
        print(f"  [{c['verdict']}] (Span {c['start_offset']}-{c['end_offset']}): \"{c['text']}\"")
        print(f"    Evidence: {c['reasoning']}")
        if c.get("sources"):
            print(f"    Sources: {len(c['sources'])} ({c['sources'][0]['domain']})")

    if report.get("ml_predictions"):
        print(f"\nLocal ML Predictions: {len(report['ml_predictions'])} claims cross-checked with trained model")
        for p in report["ml_predictions"]:
            print(f"  Claim #{p['claim_id']}: ML predicted {p['predicted_verdict']} ({p['ml_confidence']:.2%})")

    print("\nALL E2E INTEGRATION TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    run_tests()
