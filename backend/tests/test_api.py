import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.ml.model import TruthLensMLClassifier
from app.ml.dataset import FactDataset
from app.ml.train import MLTrainingHarness


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "model" in data
        assert "uptime_seconds" in data


@pytest.mark.asyncio
async def test_presets_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/presets")
        assert response.status_code == 200
        presets = response.json()
        assert len(presets) == 3
        ids = [p["id"] for p in presets]
        assert "subtle-error" in ids
        assert "severe-hallucination" in ids
        assert "accurate-reference" in ids


@pytest.mark.asyncio
async def test_analyze_pipeline():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "text": "Alexander Fleming discovered penicillin in 1945 while working at Cambridge University."
        }
        response = await client.post("/api/analyze", json=payload)
        assert response.status_code == 200
        report = response.json()
        
        assert "id" in report
        assert "metrics" in report
        assert "claims" in report
        assert report["metrics"]["total_claims"] > 0
        assert report["metrics"]["truth_score"] >= 0.0
        assert report["metrics"]["hallucination_risk"] in ["LOW", "MODERATE", "CRITICAL"]

        # Verify character offset slicing integrity
        original = report["original_text"]
        for claim in report["claims"]:
            start = claim["start_offset"]
            end = claim["end_offset"]
            assert start >= 0
            assert end > start
            sliced = original[start:end]
            assert len(sliced) > 0


@pytest.mark.asyncio
async def test_input_validation_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", json={"text": "   "})
        assert response.status_code in [400, 422]


def test_ml_model_architecture():
    # Test model initialization and synthetic training pipeline
    sample_facts = [
        {"text": "The Earth orbits the Sun every 365.25 days.", "label": "SUPPORTED"},
        {"text": "Water boils at 100 degrees Celsius at standard atmospheric pressure.", "label": "SUPPORTED"},
        {"text": "Humans landed on Mars in the year 1820.", "label": "CONTRADICTED"},
        {"text": "The Moon is made entirely of green cheddar cheese.", "label": "CONTRADICTED"},
        {"text": "Quantum entanglement occurs across interstellar distances instantaneously.", "label": "SUPPORTED"},
        {"text": "William Shakespeare wrote Harry Potter in 1599.", "label": "CONTRADICTED"},
        {"text": "The Eiffel Tower is located in Paris, France.", "label": "SUPPORTED"},
        {"text": "Albert Einstein invented the microwave oven in 1905.", "label": "CONTRADICTED"},
        {"text": "Jupiter is the largest planet in the Solar System.", "label": "SUPPORTED"},
        {"text": "The Pacific Ocean is the largest ocean on Earth.", "label": "SUPPORTED"},
        {"text": "Dinosaurs were wiped out by a cyber attack in 2000 BC.", "label": "CONTRADICTED"},
        {"text": "There might be unknown microbial life forms in deep subterranean caverns.", "label": "UNVERIFIED"},
    ]
    
    validated = FactDataset.validate_samples(sample_facts)
    assert len(validated) == 12

    harness = MLTrainingHarness(output_dir=".")
    summary = harness.run_training_cycles(validated, cycles=3)
    
    assert summary["cycles_completed"] == 3
    assert "best_f1_macro" in summary
    assert len(summary["cycle_history"]) == 3
