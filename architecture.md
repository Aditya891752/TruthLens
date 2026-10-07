# TruthLens: System Architecture Document (`architecture.md`)

## 1. Architectural Overview

TruthLens is engineered as a decoupled, high-performance two-tier application:
1. **Frontend Tier (Vercel)**: A high-contrast, responsive React (Vite) Single Page Application (SPA) designed for fast rendering, sentence-level span annotation, and interactive forensic inspection.
2. **Backend Tier (Render)**: A Python FastAPI microservice that orchestrates atomic claim decomposition, queries Google Search Grounding via the official Gemini API, synthesizes verification verdicts, and computes truth/hallucination metrics.

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|                        React 18 + Vite (Vercel)                         |
|                                                                         |
|  +-------------------+  +---------------------+  +-------------------+  |
|  |  Input Workbench  |  |  Annotated Reader   |  | Claims Inspector  |  |
|  |  (Presets/Paste)  |  | (Sentence Spans)    |  |  (Cards & Filter) |  |
|  +---------+---------+  +----------+----------+  +---------+---------+  |
|            |                       ^                       ^            |
|            | HTTP POST /api/analyze|                       |            |
+------------|-----------------------|-----------------------|------------+
             |                       |                       |
             v                       |                       |
+-------------------------------------------------------------------------+
|                              BACKEND TIER                               |
|                         FastAPI Service (Render)                        |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | CORS Middleware | Rate Limiter | Input Sanitizer (Pydantic v2)  |   |
|   +--------------------------------+--------------------------------+   |
|                                    |                                    |
|   +--------------------------------v--------------------------------+   |
|   |                   Orchestration Pipeline                        |   |
|   |                                                                 |   |
|   |  Stage 1: Atomic Claim Extractor & Character Offset Mapper      |   |
|   |  Stage 2: Google Search Grounding Engine (Gemini API)           |   |
|   |  Stage 3: Forensic Claim Verification & Contradiction Judger    |   |
|   |  Stage 4: Truth Score & Hallucination Index Aggregator          |   |
|   +--------------------------------+--------------------------------+   |
+------------------------------------|------------------------------------+
                                     |
                                     v HTTPS (Authenticated with GEMINI_API_KEY)
                  +-------------------------------------+
                  |           Google Gemini API         |
                  |     - gemini-2.5-flash / 1.5-pro    |
                  |     - Google Search Tool Grounding  |
                  +-------------------------------------+
```

---

## 2. Component Breakdown

### 2.1 Backend Architecture (FastAPI on Render)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI entry point, CORS, Rate Limiting, Exception handlers
│   ├── config.py                # Environment configuration & secret validation (Pydantic Settings)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── request.py           # AnalyzeRequest, PresetRequest
│   │   └── response.py          # Claim, Source, VerificationReport, HealthResponse
│   ├── services/
│   │   ├── __init__.py
│   │   ├── extractor.py         # Deconstructs paragraphs into atomic claims with char spans
│   │   ├── grounding.py         # Interfaces with Gemini API & Google Search Grounding
│   │   ├── verifier.py          # Evaluates claim support/contradiction against web sources
│   │   └── scoring.py           # Computes Truth Index and Hallucination Risk Score
│   └── data/
│       └── presets.py           # Curated demo scenarios (Subtle, Severe, Accurate)
├── requirements.txt             # Pinned Python dependencies
├── Dockerfile                   # Production container definition
├── render.yaml                  # Infrastructure-as-code for Render deployment
└── .env.example                 # Safe environment template
```

#### Key Backend Modules
- **`config.py`**: Validates `GEMINI_API_KEY`, `CORS_ORIGINS`, `RATE_LIMIT_PER_MINUTE`, and `ENVIRONMENT` using Pydantic Settings. Fails fast at startup if critical keys are missing.
- **`extractor.py`**: Executes structured decomposition. Breaks the user's input into discrete, atomic claims while calculating exact `start_offset` and `end_offset` pointers within the original string.
- **`grounding.py`**: Calls the Gemini API with the `google_search` grounding tool attached. Captures search queries, search entry points, and source URLs.
- **`verifier.py`**: Feeds the grounding search results and the atomic claim into a forensic prompt. Emits a deterministic verdict: `SUPPORTED`, `CONTRADICTED`, or `UNVERIFIED`, with a confidence rating (0.00–1.00) and rationale.
- **`scoring.py`**: Aggregates claim verdicts into a document-level summary.

---

### 2.2 Frontend Architecture (React + Vite on Vercel)

```
frontend/
├── index.html                   # HTML entry point with meta tags & preconnect fonts
├── package.json                 # Pinned dependencies
├── vite.config.ts               # Vite build configuration & local API proxy
├── src/
│   ├── main.tsx                 # React DOM mount
│   ├── App.tsx                  # Root application layout & state coordinator
│   ├── styles/
│   │   ├── tokens.css           # CSS custom properties (color palette, spacing, typography)
│   │   ├── reset.css            # Modern CSS reset
│   │   └── global.css           # Core typography, utility classes, high-contrast dark canvas
│   ├── components/
│   │   ├── Header.tsx           # Forensic tool branding, live engine status pill
│   │   ├── InputWorkbench.tsx   # Text input, character counter, preset triggers, analyze button
│   │   ├── MetricBar.tsx        # Truth Index gauge, Hallucination Risk badge, claim counters
│   │   ├── AnnotatedViewer.tsx  # Interactive text reader with color-coded sentence spans
│   │   ├── ClaimCard.tsx        # Individual claim card with status, reasoning, confidence, sources
│   │   ├── ClaimsList.tsx       # Filter tabs (All/Contradicted/Supported/Unverified) & card list
│   │   ├── SourceModal.tsx      # Source detail drawer with web citations & search queries
│   │   └── Toast.tsx            # Snappy feedback notifications (e.g. copied to clipboard)
│   ├── services/
│   │   └── api.ts               # Typed Fetch client communicating with backend
│   └── types/
│       └── report.ts            # TypeScript interfaces matching backend Pydantic models
└── vercel.json                  # SPA rewrite rules and security headers
```

---

## 3. Data Flow & Execution Pipeline

1. **User Submission**: The user pastes text into `InputWorkbench` or selects a preset scenario.
2. **Input Validation**:
   - Client verifies text length ($10 \le \text{length} \le 15,000$ characters).
   - Backend validates payload with Pydantic `AnalyzeRequest(text=...)`.
3. **Stage 1 — Atomic Claim Extraction**:
   - Backend prompts Gemini to identify all testable assertions and return JSON with sentence text and character offsets.
4. **Stage 2 — Google Search Grounding**:
   - Backend queries Gemini using `tools=[{"google_search": {}}]` with the extracted claims.
   - Grounding metadata extracts authoritative web source URLs, page titles, and grounding chunks.
5. **Stage 3 — Forensic Verdict Synthesis**:
   - The verifier determines if the retrieved evidence supports, refutes, or is insufficient for each claim.
6. **Stage 4 — Metric Aggregation**:
   - System computes:
     - `truth_score`: Average confidence of supported claims weighted by total claims.
     - `hallucination_risk`: Categorized as `LOW`, `MODERATE`, or `CRITICAL`.
     - `counts`: Number of supported, contradicted, and unverified claims.
7. **Client Rendering**:
   - React updates state: displays `MetricBar`, renders `AnnotatedViewer` with clickable spans, and populates `ClaimsList`.

---

## 4. API Contract & Schemas

### 4.1 `POST /api/analyze`
**Request Body**:
```json
{
  "text": "Alexander Fleming discovered penicillin in 1945 while working at Cambridge University."
}
```

**Response Body**:
```json
{
  "id": "tl-8f12c9b4",
  "analyzed_at": "2026-10-07T06:00:00Z",
  "original_text": "Alexander Fleming discovered penicillin in 1945 while working at Cambridge University.",
  "metrics": {
    "truth_score": 33.3,
    "hallucination_risk": "CRITICAL",
    "total_claims": 3,
    "supported_count": 1,
    "contradicted_count": 2,
    "unverified_count": 0
  },
  "claims": [
    {
      "id": "claim-1",
      "text": "Alexander Fleming discovered penicillin",
      "start_offset": 0,
      "end_offset": 40,
      "verdict": "SUPPORTED",
      "confidence": 0.98,
      "reasoning": "Historical and medical records confirm Sir Alexander Fleming discovered penicillin at St. Mary's Hospital.",
      "sources": [
        {
          "title": "Alexander Fleming - Nobel Prize in Physiology or Medicine",
          "url": "https://www.nobelprize.org/prizes/medicine/1945/fleming/biographical/",
          "domain": "nobelprize.org"
        }
      ]
    },
    {
      "id": "claim-2",
      "text": "discovered penicillin in 1945",
      "start_offset": 44,
      "end_offset": 51,
      "verdict": "CONTRADICTED",
      "confidence": 0.95,
      "reasoning": "Fleming discovered penicillin in 1928, not 1945. 1945 was the year he was awarded the Nobel Prize.",
      "sources": [
        {
          "title": "Discovery and Development of Penicillin - ACS",
          "url": "https://www.acs.org/education/whatischemistry/landmarks/flemingpenicillin.html",
          "domain": "acs.org"
        }
      ]
    },
    {
      "id": "claim-3",
      "text": "while working at Cambridge University",
      "start_offset": 58,
      "end_offset": 86,
      "verdict": "CONTRADICTED",
      "confidence": 0.94,
      "reasoning": "Fleming made the discovery at St Mary's Hospital Medical School in London, not Cambridge University.",
      "sources": [
        {
          "title": "Sir Alexander Fleming - Science Museum Group",
          "url": "https://collection.sciencemuseumgroup.org.uk/people/ap27344/fleming-sir-alexander",
          "domain": "sciencemuseumgroup.org.uk"
        }
      ]
    }
  ]
}
```

### 4.2 `GET /api/presets`
Returns pre-configured scenarios (`subtle_hallucination`, `severe_hallucination`, `accurate_reference`) for instant testing.

### 4.3 `GET /api/health`
Returns backend health status, uptime, environment, and AI provider status.

---

## 5. Security & Isolation Architecture

1. **Secret Isolation**:
   - `GEMINI_API_KEY` is injected strictly into the Render container environment via Render's Environment Variables dashboard.
   - Frontend repository and build artifacts contain zero references to Google API keys.
2. **CORS Boundary**:
   - FastAPI configures `CORSMiddleware` with `allow_origins` strictly matching the production Vercel domain (`https://truthlens.vercel.app` or user custom domain) and `localhost:5173` for local dev.
3. **Payload Sanitization & Protection**:
   - `slowapi` rate limiter restricts requests to 10 RPM per IP.
   - Pydantic models reject strings $>15,000$ characters.
   - Exceptions are mapped to standardized JSON errors; internal stack traces are hidden from client responses.
