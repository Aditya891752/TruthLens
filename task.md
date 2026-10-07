# TruthLens: Master Task List (`task.md`)

**Current Phase**: Phase 1 (Foundation & Setup)  
**Status**: In Progress  
**Tracking Mode**: GSD (Get Shit Done) Dependency Wave Execution

---

## Progress Overview

- [ ] **Phase 1: Environment & Foundation Setup**
- [ ] **Phase 2: Backend AI Grounding Engine & Machine Learning Model Architecture**
- [ ] **[USER GATE] Machine Learning Training Cycles (3x over 6,000+ facts)**
- [ ] **Phase 3: Frontend Forensic Dashboard Implementation**
- [ ] **Phase 4: End-to-End Integration & Security Verification**
- [ ] **Phase 5: Production Deployment & Cloud Linking (Render + Vercel)**

---

## Phase 1: Environment & Foundation Setup

- [ ] **Task 1.1: Git Repository & Security Hardening**
  - **Action**: Initialize git repository, configure `.gitignore` with strict secret exclusion (`.env*`, `*.pem`, `*.key`, `__pycache__`, `node_modules`, `dist`).
  - **Files**: `.gitignore`, `.env.example`
  - **Verification**: `git status` verifies `.env` is ignored and zero secrets are tracked.
  - **Dependencies**: None.

- [ ] **Task 1.2: FastAPI Backend Scaffolding & ML Module Setup**
  - **Action**: Scaffold `backend/` directory structure, create `requirements.txt` with pinned dependencies (`fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `google-genai`, `slowapi`, `httpx`, `pytest`, `scikit-learn`, `numpy`, `joblib`). Set up `backend/app/ml/` directory.
  - **Files**: `backend/requirements.txt`, `backend/app/__init__.py`, `backend/app/config.py`, `backend/app/ml/__init__.py`
  - **Verification**: `python -m pip install -r backend/requirements.txt` installs cleanly.
  - **Dependencies**: Task 1.1.

- [ ] **Task 1.3: React + Vite Frontend Scaffolding**
  - **Action**: Initialize Vite React TypeScript project in `frontend/`, configure `package.json`, set up path aliases, remove default boilerplates.
  - **Files**: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`
  - **Verification**: `npm run build` succeeds with zero errors.
  - **Dependencies**: Task 1.1.

---

## Phase 2: Backend AI Grounding Engine & Machine Learning Architecture

- [ ] **Task 2.1: Data Schemas & Pydantic Contracts**
  - **Action**: Define typed schemas for `AnalyzeRequest`, `PresetRequest`, `Source`, `Claim`, `VerificationReport`, `MLPrediction`, and `HealthResponse`.
  - **Files**: `backend/app/models/request.py`, `backend/app/models/response.py`
  - **Verification**: Schema unit tests validate field limits ($15\text{k}$ char max) and serialization.
  - **Dependencies**: Task 1.2.

- [ ] **Task 2.2: Atomic Claim Extractor & Character Offset Mapper**
  - **Action**: Implement service that prompts Gemini to deconstruct text into falsifiable atomic claims with exact character offsets (`[start_offset, end_offset]`).
  - **Files**: `backend/app/services/extractor.py`
  - **Verification**: Unit test against sample paragraph confirms offsets accurately slice the original text.
  - **Dependencies**: Task 2.1.

- [ ] **Task 2.3: Google Search Grounding Client**
  - **Action**: Implement Gemini client using official `google-genai` SDK with `tools=[types.Tool(google_search=types.GoogleSearch())]`. Extract web citations, titles, domains, and queries.
  - **Files**: `backend/app/services/grounding.py`
  - **Verification**: Test query returns structured citations and grounding metadata.
  - **Dependencies**: Task 2.1.

- [ ] **Task 2.4: Forensic Claim Verifier & Verdict Synthesizer**
  - **Action**: Implement verdict classification (`SUPPORTED`, `CONTRADICTED`, `UNVERIFIED`), confidence calculation, and rationale synthesis.
  - **Files**: `backend/app/services/verifier.py`
  - **Verification**: Correctly identifies contradicted statements with counter-evidence.
  - **Dependencies**: Tasks 2.2, 2.3.

- [ ] **Task 2.5: Machine Learning Fact-Checking Model & Training Pipeline**
  - **Action**: Implement the dedicated Machine Learning model architecture (`backend/app/ml/model.py`), feature extraction pipeline, and multi-stage training harness (`backend/app/ml/train.py`).
  - **Files**: `backend/app/ml/model.py`, `backend/app/ml/train.py`, `backend/app/ml/dataset.py`
  - **Verification**: Pipeline initializes and validates input data structures cleanly.
  - **Dependencies**: Task 2.1.

- [ ] **Task 2.6: [MANDATORY GATE] User Data Ingestion & 3x ML Training Execution**
  - **Action**: STOP and ask the user for the dataset of 6,000+ facts. Train the ML model for 3 full cycles with evaluation checkpoints.
  - **Files**: `backend/app/ml/trained_model.joblib`, `backend/app/ml/training_metrics.json`
  - **Verification**: Model artifact generated and evaluated across 3 training runs.
  - **Dependencies**: Task 2.5.

- [ ] **Task 2.7: Truth Score & Hallucination Index Aggregator**
  - **Action**: Implement aggregate scoring formula fusing Grounded Search results with the trained ML classifier.
  - **Files**: `backend/app/services/scoring.py`
  - **Verification**: Mathematical edge cases verified via pytest.
  - **Dependencies**: Tasks 2.4, 2.6.

- [ ] **Task 2.8: FastAPI Main Application, CORS & Middleware**
  - **Action**: Build `backend/app/main.py` with routes `POST /api/analyze`, `GET /api/health`, `GET /api/presets`, `GET /api/ml-stats`, CORS middleware, `slowapi` rate limiter, and centralized exception handling.
  - **Files**: `backend/app/main.py`, `backend/app/data/presets.py`
  - **Verification**: `curl http://localhost:8000/api/health` returns status OK and engine readiness.
  - **Dependencies**: Task 2.7.

- [ ] **Task 2.9: Backend Integration & Mock/Live Pytest Suite**
  - **Action**: Write comprehensive pytest suite with HTTPX test client testing happy paths, rate limiting, validation errors, and preset endpoints.
  - **Files**: `backend/tests/test_api.py`, `backend/tests/test_pipeline.py`
  - **Verification**: `pytest backend/tests/` passes 100%.
  - **Dependencies**: Task 2.8.

---

## Phase 3: Frontend Forensic Dashboard Implementation

- [ ] **Task 3.1: Design Tokens & CSS Architecture**
  - **Action**: Implement `tokens.css`, `reset.css`, and `global.css` strictly adhering to `rules.md` and `design.md` (high-contrast obsidian palette, Plus Jakarta Sans, JetBrains Mono, zero gradients).
  - **Files**: `frontend/src/styles/tokens.css`, `frontend/src/styles/reset.css`, `frontend/src/styles/global.css`
  - **Verification**: Tokens correctly render in browser with proper typography and colors.
  - **Dependencies**: Task 1.3.

- [ ] **Task 3.2: Typed API Service & State Models**
  - **Action**: Implement `frontend/src/services/api.ts` with abort controllers, timeout logic, and typed error handling.
  - **Files**: `frontend/src/services/api.ts`, `frontend/src/types/report.ts`
  - **Verification**: TypeScript type checking passes cleanly (`npm run build`).
  - **Dependencies**: Task 3.1.

- [ ] **Task 3.3: Header & Live Telemetry Indicator**
  - **Action**: Build `Header.tsx` displaying application title, version tag, and live backend connection heartbeat.
  - **Files**: `frontend/src/components/Header.tsx`
  - **Verification**: Component reflects backend online/offline status dynamically.
  - **Dependencies**: Task 3.2.

- [ ] **Task 3.4: Input Workbench & Preset Selector**
  - **Action**: Build `InputWorkbench.tsx` with textarea, character counter ($15\text{k}$ max), preset scenario buttons (Subtle, Severe, Accurate), and primary action button.
  - **Files**: `frontend/src/components/InputWorkbench.tsx`
  - **Verification**: Clicking presets populates text instantly; character count updates live.
  - **Dependencies**: Task 3.2.

- [ ] **Task 3.5: Metric Bar Component**
  - **Action**: Build `MetricBar.tsx` displaying Truth Index percentage gauge, Hallucination Risk pill (`LOW`, `MODERATE`, `CRITICAL`), and claim category tallies.
  - **Files**: `frontend/src/components/MetricBar.tsx`
  - **Verification**: Gauge visually reflects score with appropriate semantic color.
  - **Dependencies**: Task 3.2.

- [ ] **Task 3.6: Interactive Annotated Text Viewer**
  - **Action**: Build `AnnotatedViewer.tsx` that reconstructs the original text with color-coded underlines and background tints for each claim span. Clicking any span focuses the corresponding claim card.
  - **Files**: `frontend/src/components/AnnotatedViewer.tsx`
  - **Verification**: Spans map accurately to exact words; hover/click states are fast and responsive.
  - **Dependencies**: Task 3.5.

- [ ] **Task 3.7: Filterable Claims Stream & Source Inspector**
  - **Action**: Build `ClaimsList.tsx` and `ClaimCard.tsx` with status filter tabs (`All`, `Contradicted`, `Supported`, `Unverified`), confidence indicators, forensic reasoning blocks, and clickable external source links.
  - **Files**: `frontend/src/components/ClaimsList.tsx`, `frontend/src/components/ClaimCard.tsx`
  - **Verification**: Filter tabs correctly isolate contradicted claims; source links open in new tabs.
  - **Dependencies**: Task 3.6.

- [ ] **Task 3.8: Report Export & Copy Audit Summary**
  - **Action**: Implement clipboard copy for Markdown audit summary and JSON download of full forensic report.
  - **Files**: `frontend/src/components/ExportToolbar.tsx`, `frontend/src/components/Toast.tsx`
  - **Verification**: Copy triggers toast notification; copied markdown format is clean and readable.
  - **Dependencies**: Task 3.7.

---

## Phase 4: End-to-End Integration & Security Verification

- [ ] **Task 4.1: Local Full-Stack Integration**
  - **Action**: Connect frontend to local backend server, test full analysis lifecycle across multiple realistic test inputs.
  - **Verification**: Complete end-to-end analysis runs in under 5 seconds.
  - **Dependencies**: Phase 2, Phase 3.

- [ ] **Task 4.2: Automated Browser Verification**
  - **Action**: Validate all user stories (US-001 through US-005) in browser, verifying responsive layout, span click interactions, and accessibility.
  - **Verification**: Visual audit confirms compliance with negative design rules (no purple-blue gradient, high contrast, clean typography).
  - **Dependencies**: Task 4.1.

- [ ] **Task 4.3: Security & Codebase Audit**
  - **Action**: Perform complete scan against the 12 cardinal security rules in `rules.md`. Verify the 3 highest-risk fixes: zero frontend secrets, clean git history and `.gitignore`, active rate limiting.
  - **Verification**: `grep -rn "AIzaSy" .` returns zero results; `.env` is untracked.
  - **Dependencies**: Task 4.2.

---

## Phase 5: Production Deployment & Cloud Linking (Render + Vercel)

- [ ] **Task 5.1: Backend Production Assets (Render)**
  - **Action**: Create `Dockerfile` and `render.yaml` for Render web service deployment.
  - **Files**: `backend/Dockerfile`, `backend/render.yaml`
  - **Verification**: Docker container builds and starts locally without errors.
  - **Dependencies**: Phase 4.

- [ ] **Task 5.2: Frontend Production Configuration (Vercel)**
  - **Action**: Create `vercel.json` with SPA routing and security headers.
  - **Files**: `frontend/vercel.json`
  - **Verification**: `npm run build` generates production bundle in `frontend/dist/`.
  - **Dependencies**: Phase 4.

- [ ] **Task 5.3: Production Verification & Handshake**
  - **Action**: Deploy to Render and Vercel following `architecture_diagram.md`. Configure CORS and environment variables, test live deployed URL.
  - **Verification**: Live domain `https://truthlens.vercel.app` performs analysis against live Render API.
  - **Dependencies**: Tasks 5.1, 5.2.
