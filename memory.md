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

- **Simultaneous Memory Updates**: `memory.md` must be updated continuously after every major task, decision, and phase.
- **Strict Adherence to Guidelines**:
  - `rules.md`: Strictly enforce all 12 security rules (the 3 highest-risk fixes first) and the 19 negative aesthetic constraints.
  - `design.md`: Implement the exact obsidian palette (`#090A0F`, `#12151E`), `Plus Jakarta Sans` + `JetBrains Mono` typography, high contrast, zero gradients.
  - `techstack.md`: Python FastAPI backend + React 18 / Vite TypeScript frontend with Vanilla CSS design tokens.
  - `task.md`: Follow GSD wave progression strictly.
- **Machine Learning Model Training Directive**:
  - Build the dedicated Machine Learning model architecture and training pipeline.
  - **MANDATORY GATE**: When the ML model architecture and training harness are constructed, **STOP and ask the user for data** to train the model.
  - **Target**: Train the model at least **3 times** with over **6,000+ facts** in total.
- **AI & Plugin Governance**:
  - Ask the user before introducing any new AI model/provider. Use Google Gemini with Google Search Grounding as the established engine.
  - Leverage connected Antigravity plugins whenever needed.

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

- **Current Phase**: **Phase 1: Environment & Foundation Setup**
- **Status Ledger**:
  - [x] Master documentation created (`prd.md`, `architecture.md`, `architecture_diagram.md`, `techstack.md`, `aistack.md`, `rules.md`, `design.md`, `task.md`, `memory.md`).
  - [x] Memory updated with live user directives and ML model training requirement.
  - [ ] **Task 1.1**: Git repository initialization & `.gitignore` security hardening.
  - [ ] **Task 1.2**: Backend scaffolding (FastAPI, requirements.txt, config, ML model module setup).
  - [ ] **Task 1.3**: Frontend scaffolding (React, Vite, TypeScript, Vanilla CSS design tokens).
  - [ ] **Phase 2**: Backend Grounding Engine & ML Model Architecture.
  - [ ] **ML Training Gate**: Prompt user for 6,000+ facts dataset and execute 3-stage training.
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
