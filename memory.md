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
  - `task.md`: GSD wave progression followed strictly.
- **Machine Learning Model Training Directive**:
  - The dedicated Machine Learning model architecture (`TruthLensMLClassifier`), feature extraction pipeline, and multi-stage training harness (`backend/app/ml/train.py`) have been constructed and verified.
  - **MANDATORY GATE REACHED**: The ML model is built and ready for user training data.
  - **Next Step for Model**: Prompt user for the dataset of 6,000+ facts and execute 3-cycle training.
- **AI & Plugin Governance**:
  - Google Gemini with Google Search Grounding is configured as the verified AI engine.
  - No new AI provider will be introduced without prior user authorization.

---

## 3. Strict Negative Directives (Permanent Enforcement)

### 3.1 Three Highest-Risk Fixes (Always Prioritized)
1. **Zero Secret Leakage in Client Bundles**: Keep `GEMINI_API_KEY` exclusively on the FastAPI backend; never expose raw backend secrets to Vite/frontend.
2. **Never Expose or Commit `.env` / Secrets**: Enforce `.gitignore` from commit #0; only commit `.env.example`.
3. **Always Enforce Backend Rate Limiting & Input Validation**: Limit to 10 RPM/IP and cap text at 15,000 characters.

### 3.2 Visual & Aesthetic Prohibitions
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

- **Current Status**: **Phase 1 & Phase 2 Complete — At ML Training Data Gate**
- **Status Ledger**:
  - [x] Master documentation created (`prd.md`, `architecture.md`, `architecture_diagram.md`, `techstack.md`, `aistack.md`, `rules.md`, `design.md`, `task.md`, `memory.md`).
  - [x] Memory updated with live user directives and ML model training requirement.
  - [x] **Task 1.1**: Git repository initialization & `.gitignore` security hardening.
  - [x] **Task 1.2**: Backend scaffolding (FastAPI, requirements.txt, config, ML module).
  - [x] **Task 1.3**: Frontend scaffolding (React, Vite, TypeScript, `npm run build` verified).
  - [x] **Task 2.1**: Pydantic request/response schemas.
  - [x] **Task 2.2**: Atomic claim extractor with character offsets (`extractor.py`).
  - [x] **Task 2.3**: Google Search Grounding service (`grounding.py`).
  - [x] **Task 2.4**: Forensic claim verifier & synthesizer (`verifier.py`).
  - [x] **Task 2.5**: Machine Learning fact-checking architecture & training harness (`model.py`, `dataset.py`, `train.py`).
  - [x] **Task 2.7**: Truth Score & Hallucination Index scoring module (`scoring.py`).
  - [x] **Task 2.8**: FastAPI main application with CORS, rate limiting, and exception sanitization (`main.py`).
  - [x] **Task 2.9**: Pytest test suite (100% passing).
  - [ ] **Task 2.6 (ACTIVE GATE)**: Prompt user for 6,000+ facts dataset and execute 3-cycle ML training.
  - [ ] **Phase 3**: Frontend UI Dashboard with zero banned patterns.
  - [ ] **Phase 4**: End-to-end integration and security audit.
  - [ ] **Phase 5**: Production deployment to Render + Vercel.

---

## 5. Architectural Decision Records (ADRs)

- **ADR-001**: Two-Stage Atomic Claim Extraction & Grounded Verification Pipeline.
- **ADR-002**: Zero-Secret Client Boundary (FastAPI proxies all AI & Search calls).
- **ADR-003**: Pure Vanilla CSS Design Tokens (Strictly No Tailwind / No Untouched Shadcn).
- **ADR-004**: Decoupled Cloud Deployment (Render for FastAPI, Vercel for React SPA).
- **ADR-005**: Hybrid Grounding + Local ML Classifier: Gemini with Google Search Grounding for live web retrieval and citations, augmented by a specialized local ML claim verifier trained across 6,000+ facts over 3 training cycles.
