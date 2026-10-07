# TruthLens: Architecture Diagram & Deployment Guide (`architecture_diagram.md`)

This document provides visual architectural diagrams and an exact step-by-step procedure to deploy the FastAPI backend on **Render**, deploy the React frontend on **Vercel**, and connect them securely in production.

---

## 1. System Topology & Networking Diagram

```mermaid
flowchart TB
    subgraph ClientBrowser ["Client Web Browser"]
        User["User / Researcher"]
        SPA["TruthLens SPA (React 18 + Vite)\nHigh-Contrast Forensic UI"]
    end

    subgraph VercelEdge ["Vercel Edge Network (Frontend Host)"]
        VercelCDN["Vercel Global CDN / Edge"]
        VercelStatic["Static Assets (HTML/CSS/JS/Wasm)\nZero Secrets / Zero API Keys"]
        VercelEnv["Environment Config:\nVITE_API_URL = https://truthlens-backend.onrender.com"]
    end

    subgraph RenderPlatform ["Render Cloud (Backend Host)"]
        RenderLB["Render Cloud Load Balancer / Reverse Proxy\n(HTTPS Termination)"]
        FastAPIService["FastAPI Application (Uvicorn Worker)\nDocker / Python 3.11 Runtime"]
        
        subgraph BackendComponents ["Internal Backend Architecture"]
            CORS["CORS Middleware\n(Allows Vercel Origin Only)"]
            RateLimiter["Rate Limiting (10 req/min/IP)"]
            PydanticVal["Pydantic Input Validation\n(Max 15k chars, Sanitized)"]
            Extractor["Claim Extractor & Span Mapper"]
            GroundingSvc["Google Grounding Client"]
            VerdictJudge["Forensic Claim Verifier"]
            Scorer["Truth & Hallucination Index Aggregator"]
        end
        
        RenderSecrets["Render Environment Variables:\n- GEMINI_API_KEY (Secret)\n- CORS_ORIGINS = https://truthlens.vercel.app\n- ENVIRONMENT = production"]
    end

    subgraph GoogleAICloud ["Google Cloud / Gemini API"]
        GeminiEngine["Gemini 2.5 Flash / 1.5 Pro\nwith Google Search Tool Grounding"]
        LiveSearch["Google Search Engine\n(Real-time Web Index & Fact Retrieval)"]
    end

    User -->|1. Opens https://truthlens.vercel.app| VercelCDN
    VercelCDN --> SPA
    SPA -->|2. POST /api/analyze\nPayload: text to verify| RenderLB
    RenderLB --> FastAPIService
    
    FastAPIService --> CORS --> RateLimiter --> PydanticVal
    PydanticVal --> Extractor
    Extractor --> GroundingSvc
    GroundingSvc -->|3. HTTPS Request with GEMINI_API_KEY\nClaim queries with google_search tool| GeminiEngine
    GeminiEngine <-->|4. Real-time web index search| LiveSearch
    GeminiEngine -->|5. Returns GroundingMetadata + Web Sources| GroundingSvc
    GroundingSvc --> VerdictJudge
    VerdictJudge --> Scorer
    Scorer -->|6. JSON: Annotated Spans, Claims, Citations, Truth Index| SPA
    SPA -->|7. Renders Interactive Highlights & Source Cards| User

    RenderSecrets -.->|Secure Server-Only Injection| FastAPIService
    VercelEnv -.->|Public Client Variable| SPA
```

---

## 2. Sequence Diagram: Claim Grounding Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant UI as React Frontend (Vercel)
    participant API as FastAPI (Render)
    participant GEM as Gemini API (Google Cloud)
    participant WEB as Google Search Engine

    User->>UI: Pastes text and clicks "Analyze Factuality"
    UI->>UI: Validates text length (10-15k chars)
    UI->>API: POST /api/analyze { text }
    Note over API: Check Rate Limit & Sanitize Input
    API->>GEM: Prompt: Decompose into atomic claims & char spans
    GEM-->>API: JSON: List of atomic claims with offsets
    
    loop For each atomic claim (batched)
        API->>GEM: Query claim with tools=[{google_search: {}}]
        GEM->>WEB: Search live authoritative sources
        WEB-->>GEM: Relevant pages, snippets, and URLs
        GEM-->>API: GroundingMetadata (sources, queries, snippets)
        API->>GEM: Verify: Classify as SUPPORTED / CONTRADICTED / UNVERIFIED + rationale
        GEM-->>API: Verdict, Confidence (0.00-1.00), Reason
    end

    API->>API: Aggregate Truth Index & Hallucination Risk
    API-->>UI: Return 200 OK with complete JSON audit report
    UI->>User: Display annotated text with color spans & source cards
```

---

## 3. Step-by-Step Deployment Guide: Render + Vercel

Follow these exact steps to deploy both components and join them together seamlessly.

### Step 3.1: Repository Layout
Structure your project as a clean monorepo:
```
truthlens/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
└── README.md
```

---

### Step 3.2: Deploy Backend on Render

1. **Sign in to Render**: Navigate to [dashboard.render.com](https://dashboard.render.com).
2. **Create New Web Service**:
   - Click **New +** $\rightarrow$ **Web Service**.
   - Connect your GitHub repository (`truthlens`).
3. **Configure Service Settings**:
   - **Name**: `truthlens-backend`
   - **Region**: Choose closest to your target audience (e.g., `Oregon (US West)` or `Frankfurt (EU)`).
   - **Root Directory**: `backend`
   - **Environment / Runtime**: `Python 3` (or `Docker` using the provided `Dockerfile`).
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
     ```
   - **Plan**: Free or Starter ($7/mo).
4. **Configure Environment Variables** (in Render Dashboard $\rightarrow$ **Environment**):
   | Key | Value | Description |
   |---|---|---|
   | `GEMINI_API_KEY` | `AIzaSy...` | Your secret Google Gemini API key |
   | `CORS_ORIGINS` | `https://truthlens.vercel.app,http://localhost:5173` | Allowed frontend origins (comma-separated) |
   | `ENVIRONMENT` | `production` | Disables debug mode and Swagger in prod |
   | `RATE_LIMIT_PER_MINUTE` | `10` | Rate limit protection |
5. **Click "Create Web Service"**:
   - Render will build and deploy the application.
   - Note down your backend URL: `https://truthlens-backend.onrender.com`.
   - Test health in your browser or terminal:
     ```bash
     curl https://truthlens-backend.onrender.com/api/health
     ```

---

### Step 3.3: Deploy Frontend on Vercel

1. **Sign in to Vercel**: Navigate to [vercel.com](https://vercel.com).
2. **Add New Project**:
   - Click **Add New...** $\rightarrow$ **Project**.
   - Import your GitHub repository (`truthlens`).
3. **Configure Build & Output Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
4. **Configure Environment Variables**:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://truthlens-backend.onrender.com` | The live Render backend URL from Step 3.2 |
5. **Configure SPA Rewrites (`vercel.json`)**:
   Ensure `frontend/vercel.json` exists with SPA routing rules:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
         ]
       }
     ]
   }
   ```
6. **Deploy**:
   - Click **Deploy**.
   - Vercel will build and assign your production domain: `https://truthlens.vercel.app`.

---

### Step 3.4: Joining Backend & Frontend (CORS Handshake)

1. Return to the **Render Dashboard** $\rightarrow$ `truthlens-backend` $\rightarrow$ **Environment**.
2. Update `CORS_ORIGINS` to include your exact Vercel production domain:
   ```env
   CORS_ORIGINS=https://truthlens.vercel.app,https://truthlens-*.vercel.app,http://localhost:5173
   ```
3. Click **Save Changes** (Render will automatically redeploy with zero downtime).
4. Verify the end-to-end integration:
   - Visit `https://truthlens.vercel.app` in your browser.
   - Click one of the built-in preset cards (e.g. "Subtle Hallucination").
   - Click "Analyze Factuality".
   - Confirm the analysis completes and the interactive annotated report is displayed with citations.

---

### Step 3.5: Handling Render Cold Starts (Free Tier)
If using Render's free tier, backend instances spin down after 15 minutes of inactivity:
- The React frontend includes a built-in "Waking up analysis engine..." banner if the first health check takes $>3$ seconds.
- You can optionally set up a free health check cron on [cron-job.org](https://cron-job.org) pinging `https://truthlens-backend.onrender.com/api/health` every 10 minutes to keep the instance warm.
