# TruthLens 🔍

> **Autonomous Open-Domain Forensic Fact Verification System**  
> Real-time atomic claim extraction, grounded multi-source verification, and transparent credibility scoring designed with the Google Stitch white color grading forensic design system.

---

## ⚡ Overview

**TruthLens** is a production-grade full-stack fact-checking and forensic analysis platform. When provided with unstructured text, investigative reporting, or social media statements, TruthLens automatically decomposes the input into atomic factual claims, searches live corroborated sources, and delivers evidence-backed veracity verdicts with mathematical confidence scores.

TruthLens operates with a **Zero-Secret Client Boundary**—all AI inference, search grounding, and external API queries are executed strictly server-side through a high-performance FastAPI proxy.

---

## 🔬 Core Capabilities

### 1. Atomic Claim Extraction
- Decomposes dense narrative paragraphs into discrete, independently verifiable factual assertions.
- Preserves exact character offsets (`[start, end]`) for bi-directional highlighting in the interactive document viewer.
- Categorizes assertions into domain entities (e.g., *historical, scientific, political, statistical, geographic*).

### 2. 4-Tier Hybrid Open-Domain Verification Engine
TruthLens is engineered to verify **arbitrary user inputs** across any topic through a robust, tiered verification waterfall:
- **Tier 1: Google Search Grounding with Gemini**: Real-time web retrieval powered by the Google GenAI SDK, returning direct corroboration URLs, authoritative publisher snippets, and live citation links.
- **Tier 2: 19.3k Factbase Engine**: A locally indexed knowledge bank of **19,301 curated facts**, indexed via TF-IDF vectorization and sub-millisecond cosine similarity search.
- **Tier 3: Wikipedia Open-Knowledge API**: Zero-API-key fallback querying live Wikipedia REST endpoints with in-memory LRU caching for encyclopedic historical, biographical, and scientific claims.
- **Tier 4: Factual Contradiction Heuristics**: Deterministic syntactic & semantic detectors that identify chronological violations, antonym inversions, and numerical/quantity discrepancies.

### 3. Machine Learning Claim Verifier
- **Trained Dataset**: 19,301 factual claims across multiple benchmark datasets (`expanded_facts_4500`, `fact_checker_dataset_4500`, TrustCheck corpus).
- **Training Regimen**: 3 rigorous iterative training cycles with balanced class re-weighting.
- **Performance**:
  - **Validation Accuracy**: **85.29%**
  - **Macro F1 Score**: **0.8519**
  - **Precision / Recall**: **0.8530 / 0.8529**

### 4. Mathematical Credibility Scoring
TruthLens computes an overall document credibility index (0–100%) using a calibrated harmonic weighting:
- **Supported Claims Weight**: $+1.0 \times \text{confidence}$
- **Contradicted Claims Weight**: $-1.5 \times \text{confidence}$ (harsh penalty for falsehoods)
- **Unverified Claims Weight**: $-0.2$ (uncertainty penalty)

---

## 🎨 UI/UX: Google Stitch Forensic Design System

TruthLens adheres to a disciplined, clinical, high-contrast aesthetic:
- **Canvas**: Clean high-contrast white background (`#FFFFFF`) with surgical blue primary accents (`#006194`).
- **Semantic Indicators**:
  - Emerald Green (`#006C4A`) for corroborated, supported assertions.
  - Crimson Red (`#BA1A1A`) for debunked contradictions.
  - Amber Gold (`#D97706`) for unverified or speculative claims.
- **Typography**: Google Fonts **Plus Jakarta Sans** for clear forensic hierarchy and **JetBrains Mono** for telemetry data, confidence metrics, and character coordinates.
- **Strict CSS Architecture**: Pure Vanilla CSS design tokens (`tokens.css`, `reset.css`, `global.css`). Zero Tailwind runtime overhead, zero CSS utility bloat.
- **Navigation Suite**: 4 integrated forensic views:
  1. **Workbench**: Dual-pane editor, interactive offset highlighter, and claim verification cards.
  2. **Telemetry**: Real-time latency, token usage, API tier waterfalls, and ground score metrics.
  3. **Data Lineage**: Training dataset origins, TF-IDF feature distributions, and version logs.
  4. **Diagnostics**: System health monitors, model memory profiles, and endpoint test runner.

---

## 📁 Repository Structure

```
TRUTHLENS/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & CORS config
│   │   ├── extractor.py             # Atomic claim extraction with character offsets
│   │   ├── grounding.py             # Gemini Google Search Grounding service
│   │   ├── verifier.py              # 4-tier open-domain verification engine
│   │   ├── scoring.py               # Mathematical document credibility scoring
│   │   ├── models.py                # Pydantic v2 data contracts
│   │   └── config.py                # Strict environment settings & security boundaries
│   ├── tests/
│   │   ├── test_api.py              # Pytest backend API suite (7/7 passing)
│   │   ├── test_e2e_proxy.py        # End-to-end integration proxy test
│   │   └── test_random_user_input.py # Open-domain test suite across arbitrary inputs
│   ├── train_model.py               # ML training pipeline for 19.3k factbase
│   ├── Dockerfile                   # Production container definition
│   ├── render.yaml                  # Render cloud deployment blueprint
│   └── requirements.txt             # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Stitch White design system components
│   │   │   ├── Header.tsx           # Global branding & view switcher
│   │   │   ├── InputWorkbench.tsx   # Text input & sample claim injection
│   │   │   ├── MetricBar.tsx        # High-level credibility meter & tally
│   │   │   ├── AnnotatedViewer.tsx  # Character-offset inline claim highlighter
│   │   │   ├── ClaimCard.tsx        # Detailed verdict card with sources & rationale
│   │   │   ├── ClaimsList.tsx       # Filterable claim list
│   │   │   ├── ExportToolbar.tsx    # JSON & Markdown forensic report exports
│   │   │   ├── TelemetryView.tsx    # Latency, token count, and engine telemetry
│   │   │   ├── LineageView.tsx      # Dataset facts breakdown & model lineage
│   │   │   └── DiagnosticsView.tsx  # Service health & endpoint diagnostics
│   │   ├── styles/                  # Pure Vanilla CSS tokens & styling
│   │   ├── App.tsx                  # State manager & API client
│   │   └── main.tsx                 # React 19 entrypoint
│   ├── vercel.json                  # Vercel SPA routing & security headers
│   ├── package.json                 # Node.js dependencies
│   └── vite.config.ts               # Vite configuration with /api backend proxy
│
├── prd.md                           # Product Requirements Document
├── architecture.md                  # Comprehensive system architecture
├── architecture_diagram.md          # Visual architecture & Render/Vercel guide
├── aistack.md                       # AI/ML pipeline & grounding specifications
├── techstack.md                     # Full-stack technology choices & boundaries
├── design.md                        # Google Stitch white color grading design rules
├── rules.md                         # Strict security & code standards
├── task.md                          # Milestone tracking & verification plan
└── memory.md                        # Persistent project memory & ADR ledger
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Google Gemini API Key (optional for basic local mode; required for live Google Search Grounding)

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# Run tests
pytest tests -v

# Start development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build   # Validate clean TypeScript build
npm run dev     # Starts Vite dev server with proxy at http://localhost:5173
```

---

## 🚢 Deployment

TruthLens is pre-configured for a zero-cost, high-performance decoupled cloud deployment:

| Service | Platform | Configuration File | Notes |
| :--- | :--- | :--- | :--- |
| **Backend API** | [Render](https://render.com) | [`backend/render.yaml`](file:///d:/TRUTHLENS/backend/render.yaml) | Docker Web Service with health check at `/health` |
| **Frontend SPA** | [Vercel](https://vercel.com) | [`frontend/vercel.json`](file:///d:/TRUTHLENS/frontend/vercel.json) | Static React SPA with rewrite proxy to Render backend |

Detailed step-by-step cloud deployment instructions are documented in [`architecture_diagram.md`](file:///d:/TRUTHLENS/architecture_diagram.md).

---

## 🔒 Security & Safety Principles

1. **Zero Secret Leakage**: API keys, service tokens, and environment configs are strictly prohibited from client bundles and git history.
2. **Pydantic Validation**: Every request payload and API response is strictly validated against schemas in `backend/app/models.py`.
3. **CORS Strictness**: Restricts origins strictly to configured frontend hosts.
4. **Resilient Fallbacks**: If external API quotas are exhausted, TruthLens seamlessly downgrades to local TF-IDF and Wikipedia verification without crashing.

---

## 📄 License
TruthLens is licensed under the [MIT License](LICENSE).