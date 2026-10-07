# Product Requirements Document (PRD): TruthLens

## 1. Introduction & Overview

**TruthLens** is an open-domain AI and LLM output factuality analyzer. As foundation models increasingly generate fluent but hallucinated statements, users, researchers, journalists, and engineers require an automated forensic lens that can deconstruct generated text into discrete atomic claims, verify each claim against real-time live web evidence, and deliver an interactive, transparent audit report with direct citations.

TruthLens bridges the gap between opaque LLM responses and verifiable reality by decomposing complex text into atomic factual claims, executing live Google Search Grounding queries, scoring claim truthfulness (`SUPPORTED`, `CONTRADICTED`, `UNVERIFIED`), and providing an interactive web dashboard with inline color-coded claim spans and direct source links.

---

## 2. Goals

- **Atomic Claim Extraction**: Deconstruct any multi-paragraph text or LLM response into isolated, verifiable factual assertions.
- **Real-Time Web Grounding**: Verify each atomic claim against live, authoritative web sources using Google Search Grounding.
- **Transparent Classification**: Classify every claim into one of three distinct statuses:
  - `SUPPORTED`: Validated by credible web evidence with matching source snippets.
  - `CONTRADICTED`: Explicitly refuted by authoritative sources, accompanied by counter-evidence.
  - `UNVERIFIED`: Ambiguous, ungrounded, or lacking conclusive public documentation.
- **Explainable Metrics**: Calculate an overall **Truth Index** (0–100%) and **Hallucination Risk Level** (Low, Moderate, Critical).
- **Interactive Forensic UI**: Provide an intuitive, high-contrast dashboard with inline text highlights, claim cards, source links, search query inspection, and quick demo presets.
- **Production-Ready & Secure**: Deploy as an isolated Python (FastAPI) backend on Render and a React (Vite) frontend on Vercel with zero exposed secrets and strict security boundaries.

---

## 3. User Stories

### US-001: Analyze Text for Hallucinations
**Description**: As a user, I want to paste an AI-generated paragraph into TruthLens so that I can immediately check its factual accuracy against live web sources.

**Acceptance Criteria**:
- [ ] User can paste up to 15,000 characters of text into the input workbench.
- [ ] Clicking "Analyze Factuality" triggers backend verification.
- [ ] An active analysis status indicator shows progress (extracting claims $\rightarrow$ searching web $\rightarrow$ verifying evidence).
- [ ] Frontend displays the overall Truth Index, Hallucination Risk Level, and claim breakdown.
- [ ] Verify in browser using dev-browser skill.

### US-002: Inline Text Span Highlighting
**Description**: As a researcher or reader, I want to see which exact sentences in the original text are supported, contradicted, or unverified so that I can quickly spot where the hallucination occurred.

**Acceptance Criteria**:
- [ ] Original text is rendered with color-coded underlines/highlights matching claim verdicts (Emerald for Supported, Crimson for Contradicted, Amber for Unverified).
- [ ] Clicking or hovering on an annotated span focuses the corresponding claim card.
- [ ] Unannotated text (opinions, filler sentences) remains neutral and legible without visual clutter.
- [ ] High contrast ratios (WCAG AA/AAA) are maintained across all states.
- [ ] Verify in browser using dev-browser skill.

### US-003: Detailed Claim Cards & Source Citations
**Description**: As an analyst, I want to review the evidence and direct web links for each claim so that I can verify the ground truth myself.

**Acceptance Criteria**:
- [ ] Each claim card displays: Claim text, Status badge, Confidence score (0–100%), Evidence rationale, and List of web sources.
- [ ] Web sources include page title, publisher domain, and external clickable link.
- [ ] Clicking a source link opens the original article in a new tab with `rel="noopener noreferrer"`.
- [ ] Cards can be filtered by status (`All`, `Contradicted`, `Supported`, `Unverified`).
- [ ] Verify in browser using dev-browser skill.

### US-004: Interactive Demo Presets
**Description**: As a first-time user, I want to load pre-configured examples so that I can explore TruthLens immediately without finding or drafting hallucinated text.

**Acceptance Criteria**:
- [ ] Preset buttons provide 3 distinct scenarios:
  1. *Subtle Hallucination* (mixture of true facts and subtle fabricated dates/names).
  2. *Severe Hallucination* (completely fabricated historical or scientific claims).
  3. *Accurate Reference* (factually sound technical or current-events text).
- [ ] Selecting a preset populates the input field instantly and allows immediate one-click analysis.
- [ ] Verify in browser using dev-browser skill.

### US-005: Export & Copy Forensic Audit Report
**Description**: As a team lead or auditor, I want to export the verification report so that I can attach it to a dataset audit or compliance review.

**Acceptance Criteria**:
- [ ] User can click "Copy Audit Summary" to copy Markdown summary to clipboard.
- [ ] User can download full JSON report containing text, claims, sources, and scores.
- [ ] Clipboard action displays instant toast confirmation.
- [ ] Verify in browser using dev-browser skill.

---

## 4. Functional Requirements

- **FR-1**: Backend must accept `POST /api/analyze` with JSON payload `{ "text": string }` (max 15,000 characters).
- **FR-2**: Backend must decompose input text into atomic claims with start/end character offsets for original text mapping.
- **FR-3**: Backend must query Gemini API with Google Search Grounding (`google_search` tool enabled) to retrieve authoritative sources and metadata.
- **FR-4**: Backend must evaluate each claim into `SUPPORTED`, `CONTRADICTED`, or `UNVERIFIED` with confidence score (0.0 to 1.0) and reasoning summary.
- **FR-5**: Backend must calculate aggregate metrics:
  $$\text{Truth Index} = \frac{\sum \text{Supported Scores}}{\text{Total Claims}} \times 100$$
  $$\text{Hallucination Risk} = \begin{cases} \text{LOW} & \text{if Contradicted} = 0 \text{ and Truth Index} \ge 85\% \\ \text{MODERATE} & \text{if Contradicted} \le 1 \text{ and Truth Index} \ge 60\% \\ \text{CRITICAL} & \text{if Contradicted} \ge 2 \text{ or Truth Index} < 60\% \end{cases}$$
- **FR-6**: Backend must provide `GET /api/health` returning system status and grounding engine readiness.
- **FR-7**: Backend must handle missing or invalid API keys gracefully, returning structured error responses with HTTP 4xx/5xx status codes without exposing stack traces.
- **FR-8**: Frontend must provide responsive input workbench with character counter, preset loader, and clear button.
- **FR-9**: Frontend must provide filterable claims inspector with status filtering tabs (`All`, `Contradicted`, `Supported`, `Unverified`).
- **FR-10**: Frontend must strictly obey all design rules in `rules.md` (no purple/blue gradients, no glassmorphism, no gradient hero text, no emojis in headings, high contrast dark theme).

---

## 5. Non-Goals (Out of Scope for v1.0)

- User authentication, login accounts, and private team workspaces (v1.0 is an open, unauthenticated public web app).
- Live audio/video deepfake verification (v1.0 is dedicated strictly to text & LLM output factuality).
- Continuous background monitoring of live social media feeds (v1.0 accepts on-demand text inputs).
- Multi-language translation pipeline (v1.0 focuses on English factuality verification).

---

## 6. Design Considerations

- **Theme & Aesthetic**: High-contrast, sharp obsidian workspace (`#090A0F`, `#12151E`) with crisp semantic signals (Emerald for truth, Crimson for contradiction, Amber for unverified).
- **Typography**: `Plus Jakarta Sans` for clean UI labels and body text; `JetBrains Mono` for claim IDs, confidence percentages, and source URLs. Strictly NO Inter, NO Space Grotesk + Instrument Serif.
- **Visual Structure**: Functional forensic split layout: Input & Overview on the left (or top), Annotated Text & Detailed Claims on the right (or bottom).
- **Strict Compliance**: All rules from `rules.md` apply without exception.

---

## 7. Technical Considerations

- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS design tokens (zero Tailwind dependency, zero untouched shadcn clones).
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, official `google-genai` SDK.
- **Search & AI Grounding**: Gemini 2.5 Flash / 1.5 Pro model with native Google Search Grounding (`tools=[{"google_search": {}}]`).
- **Deployment**:
  - Frontend hosted on Vercel (static single-page application with environment variable `VITE_API_URL`).
  - Backend hosted on Render (Docker / Python Web Service with `GEMINI_API_KEY` and CORS allowed origins).

---

## 8. Success Metrics

- **Analysis Latency**: End-to-end analysis completes within 3 to 6 seconds for typical 250-word text.
- **Extraction Granularity**: 100% of factual assertions decomposed into testable atomic claims without losing original sentence context.
- **Verification Accuracy**: Contradicted claims accurately cite opposing evidence with direct Google Search URLs.
- **Security**: 0 exposed client-side secrets, 100% of requests validated on backend, zero stack trace leakages.
