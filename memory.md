# TruthLens: Project Context & Memory (`memory.md`)

This document serves as the persistent memory, live status ledger, and context anchor for TruthLens across all development sessions. Everything planned, in progress, and executed is recorded here simultaneously.

---

## 1. Project Identity & Mission

- **Project Name**: TruthLens
- **Tagline**: Real-Time AI Factuality & Hallucination Forensic Analyzer
- **Workspace Root**: `d:\TRUTHLENS`
- **Core Mission**: Provide an open-domain factuality analyzer for AI-generated text and LLM outputs. TruthLens decomposes text into atomic factual claims, queries real-time web evidence using Google Search Grounding, classifies each claim (`SUPPORTED`, `CONTRADICTED`, `UNVERIFIED`), computes a Truth Index and Hallucination Risk Score, and presents an interactive, high-contrast dashboard with sentence-level span highlighting and direct web citations.

---

## 2. Live Session Updates & User Directives (2026-10-07)

- **Simultaneous Memory Updates**: `memory.md` is updated continuously after every major task, decision, and phase.
- **Strict Adherence to Guidelines**:
  - `rules.md`: All 12 security rules and 19 negative aesthetic constraints strictly enforced.
  - `design.md`: Obsidian palette (`#090A0F`, `#12151E`), `Plus Jakarta Sans` + `JetBrains Mono` typography, high contrast, zero gradients.
  - `techstack.md`: Python FastAPI backend + React 18 / Vite TypeScript frontend with Vanilla CSS design tokens.
  - `task.md`: GSD wave progression followed strictly — 100% complete across all 5 phases.
- **Machine Learning Model Training Executed**:
  - Ingested 6,300 facts across 3 balanced classes from user directory `D:\TRUTHLENS\ML MODEL DATASET`.
  - Executed 3 distinct training cycles with baseline, sublinear, and multi-gram hyperparameter tuning.
  - Saved best model to `backend/app/ml/trained_model.joblib` and metrics to `training_metrics.json`.
- **Full-Stack Application Built & Verified**:
  - Python FastAPI backend running with rate limiting, CORS, Google Search Grounding, and ML predictions.
  - React 18 + Vite frontend built with Vanilla CSS design tokens, interactive claim span highlighting, filterable claims stream, and export toolbar.
  - Production deployment configurations created for Render (`backend/Dockerfile`, `backend/render.yaml`) and Vercel (`frontend/vercel.json`).

---

## 3. Strict Negative Directives (Permanent Enforcement)

### 3.1 Three Highest-Risk Fixes (Always Prioritized)
1. **Zero Secret Leakage in Client Bundles**: `GEMINI_API_KEY` remains exclusively on the FastAPI backend; zero secrets in frontend code.
2. **Never Expose or Commit `.env` / Secrets**: Strict `.gitignore` from commit #0; only `.env.example` committed.
3. **Always Enforce Backend Rate Limiting & Input Validation**: Limit to 10 RPM/IP and cap text at 15,000 characters.

### 3.2 Visual & Aesthetic Prohibitions (100% Compliant)
- NO purple to blue gradient
- NO gradient hero text
- NO emojis in headings
- NO Inter font everywhere (use `Plus Jakarta Sans` + `JetBrains Mono`)
- NO colored border cards
- NO glassmorphism cards (`backdrop-filter` blur)
- NO low-contrast dark mode (maintain strict high contrast `#F1F3F9` on `#090A0F`)
- NO 3 icon boxes in a row
- NO badge above the headline
- NO lucide icons everywhere
- NO untouched shadcn UI
- NO fade in on scroll
- NO cursor-following beam
- NO button fades on hover
- NO inconsistent spacing (strict 4px/8px grid)
- NO em dashes everywhere (`—`)
- NO generic passwords
- NO serif italic accents
- NO space grotesk + instrument serif
- NO grain over a gradient

---

## 4. Current Milestone & Phase Ledger

- **Current Status**: **All 5 Phases 100% Implemented, Verified, and Tested**
- **Status Ledger**:
  - [x] Master documentation created (`prd.md`, `architecture.md`, `architecture_diagram.md`, `techstack.md`, `aistack.md`, `rules.md`, `design.md`, `task.md`, `memory.md`).
  - [x] **Phase 1**: Git repository, `.gitignore` hardening, FastAPI scaffolding, React + Vite scaffolding.
  - [x] **Phase 2**: Atomic claim extractor with character offsets (`extractor.py`), Google Search Grounding service (`grounding.py`), claim verifier (`verifier.py`), scoring service (`scoring.py`), FastAPI routes and CORS (`main.py`), Pytest suite (5/5 passing).
  - [x] **ML Training**: Ingested 6,300 facts from `D:\TRUTHLENS\ML MODEL DATASET` and completed 3 training cycles (F1-macro: 0.5247, accuracy: 52.30%). Persisted model to `trained_model.joblib`.
  - [x] **Phase 3**: React forensic dashboard components: `tokens.css`, `reset.css`, `global.css`, `Header.tsx`, `InputWorkbench.tsx`, `MetricBar.tsx`, `AnnotatedViewer.tsx`, `ClaimCard.tsx`, `ClaimsList.tsx`, `ExportToolbar.tsx`, `Toast.tsx`.
  - [x] **Phase 4**: Full-stack E2E integration verified (`backend/tests/test_e2e_proxy.py` passes 100%). Security audit passed against 12 cardinal rules.
  - [x] **Phase 5**: Production assets: `backend/Dockerfile`, `backend/render.yaml`, `frontend/vercel.json`, and deployment guide in `architecture_diagram.md`.

---

## 5. Architectural Decision Records (ADRs)

- **ADR-001**: Two-Stage Atomic Claim Extraction & Grounded Verification Pipeline.
- **ADR-002**: Zero-Secret Client Boundary (FastAPI proxies all AI & Search calls).
- **ADR-003**: Pure Vanilla CSS Design Tokens (Strictly No Tailwind / No Untouched Shadcn).
- **ADR-004**: Decoupled Cloud Deployment (Render for FastAPI, Vercel for React SPA).
- **ADR-005**: Hybrid Grounding + Local ML Classifier: Gemini with Google Search Grounding for live web retrieval and citations, augmented by a specialized local ML claim verifier trained across 6,300 facts over 3 training cycles.
