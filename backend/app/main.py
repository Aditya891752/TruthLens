import time
import uuid
import os
import json
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.models.request import AnalyzeRequest
from app.models.response import (
    VerificationReport,
    HealthResponse,
    PresetItem,
    MLPrediction,
    VerdictEnum
)
from app.data.presets import get_presets
from app.services.extractor import ClaimExtractor
from app.services.grounding import GroundingService
from app.services.verifier import ClaimVerifier
from app.services.scoring import ScoringService
from app.ml.model import TruthLensMLClassifier

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI instance
app = FastAPI(
    title="TruthLens API",
    description="Real-Time AI Output Factuality & Hallucination Forensic Analyzer",
    version="1.0.0",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc"
)

# Attach rate limiter state & handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Startup telemetry
START_TIME = time.time()

# Services initialization
claim_extractor = ClaimExtractor()
grounding_service = GroundingService()
claim_verifier = ClaimVerifier()
ml_classifier = TruthLensMLClassifier()

# Attempt loading pre-trained ML model if present
ml_dir = os.path.join(os.path.dirname(__file__), "ml")
ml_model_loaded = ml_classifier.load(ml_dir) or ml_classifier.load("backend/app/ml") or ml_classifier.load(".")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Centralized exception sanitizer.
    Prevents stack trace leakage to clients (Security Rule #11).
    """
    error_id = str(uuid.uuid4())[:8]
    print(f"[Error {error_id}] Internal server error on {request.url.path}: {exc}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal error occurred while processing the forensic analysis.",
            "error_id": error_id
        }
    )


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health status and engine readiness endpoint."""
    uptime = time.time() - START_TIME
    grounding_ready = bool(settings.GEMINI_API_KEY)
    
    return HealthResponse(
        status="healthy",
        uptime_seconds=round(uptime, 2),
        environment=settings.ENVIRONMENT,
        model="gemini-2.5-flash",
        grounding_ready=grounding_ready,
        ml_model_loaded=ml_classifier.is_trained
    )


@app.get("/api/presets", response_model=List[PresetItem])
async def list_presets():
    """Returns curated demo scenarios for instant evaluation."""
    return get_presets()


@app.get("/api/ml-stats")
async def ml_statistics():
    """Returns training metrics and accuracy progression of the ML model."""
    for path in [
        os.path.join(os.path.dirname(__file__), "ml", "training_metrics.json"),
        "backend/app/ml/training_metrics.json",
        "training_metrics.json"
    ]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)

    return {
        "status": "pending_training",
        "message": "Model architecture initialized. Ready for training with 6,000+ facts dataset."
    }


@app.post("/api/analyze", response_model=VerificationReport)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def analyze_text(request: Request, payload: AnalyzeRequest):
    """
    Main forensic factuality analysis pipeline:
    1. Extracts atomic claims with exact text offsets.
    2. Queries Google Search Grounding for live web citations.
    3. Synthesizes claim verdicts and explanations.
    4. Runs local ML credibility classifier predictions.
    5. Computes Truth Index and Hallucination Risk Score.
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input text cannot be empty."
        )

    # Stage 1: Atomic Claim Extraction
    raw_claims = claim_extractor.extract_claims(raw_text)

    # Stage 2 & 3: Grounding & Claim Synthesis
    synthesized_claims = []
    ml_predictions = []

    for item in raw_claims:
        c_text = item["text"]

        # Run Grounding search & forensic evaluation
        analysis_text, sources, _ = grounding_service.query_with_grounding(c_text)
        claim_obj = claim_verifier.synthesize_claim(item, analysis_text, sources)
        synthesized_claims.append(claim_obj)

        # Run ML model prediction if loaded
        if ml_classifier.is_trained:
            pred_label, pred_conf = ml_classifier.predict(c_text, claim_obj.reasoning)
            ml_predictions.append(MLPrediction(
                claim_id=claim_obj.id,
                claim_text=c_text,
                predicted_verdict=VerdictEnum(pred_label),
                ml_confidence=pred_conf
            ))

    # Stage 4: Aggregation & Scoring
    metrics = ScoringService.calculate_metrics(synthesized_claims)

    report_id = f"tl-{uuid.uuid4().hex[:8]}"
    analyzed_timestamp = datetime.now(timezone.utc).isoformat()

    return VerificationReport(
        id=report_id,
        analyzed_at=analyzed_timestamp,
        original_text=raw_text,
        metrics=metrics,
        claims=synthesized_claims,
        ml_predictions=ml_predictions
    )
