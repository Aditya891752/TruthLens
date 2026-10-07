# TruthLens: Technology Stack Specification (`techstack.md`)

This document defines the complete technology stack for TruthLens, covering frontend, backend, AI orchestration, deployment runtimes, and engineering tooling.

---

## 1. Frontend Technology Stack

| Layer | Technology | Rationale & Configuration |
|---|---|---|
| **Framework** | **React 18** | High-performance declarative component model, ideal for dynamic span highlighting, filtering, and responsive state updates. |
| **Language** | **TypeScript 5.x** | Strict typing for end-to-end type safety between backend Pydantic schemas and frontend interfaces. |
| **Build Tool & Dev Server** | **Vite 5.x** | Instant HMR (Hot Module Replacement), fast production bundling with esbuild/Rollup, zero configuration overhead. |
| **Styling & Design System** | **Vanilla CSS (Design Tokens)** | Pure CSS custom properties (`tokens.css`, `reset.css`, `global.css`). Provides complete design autonomy, zero runtime overhead, and ensures strict compliance with aesthetic rules in `rules.md` (no generic Tailwind classes, no untouched shadcn UI). |
| **Typography** | **Plus Jakarta Sans + JetBrains Mono** | Plus Jakarta Sans for crisp, modern editorial UI text; JetBrains Mono for claim numbers, confidence scores, and URLs. *Strictly NO Inter, NO Space Grotesk + Instrument Serif.* |
| **Icons** | **Bespoke Inline SVGs** | Curated, lightweight functional SVGs. *Strictly NO Lucide icon overload.* |
| **State Management** | **React Hooks (`useReducer`, `useState`)** | Lightweight, predictable state container without external Redux/Zustand overhead. Handles text input, analysis loading states, active claim focus, and filter tabs. |
| **API Client** | **Native Typed Fetch Wrapper** | Lightweight client (`services/api.ts`) with request timeouts, abort controller cancellation on new requests, and typed error handling. |
| **Hosting Platform** | **Vercel** | Global CDN distribution, instant automatic deployments from git, zero-configuration SPA routing with `vercel.json`. |

---

## 2. Backend Technology Stack

| Layer | Technology | Rationale & Configuration |
|---|---|---|
| **Runtime Environment** | **Python 3.11+** | High execution speed, native async/await support, strong ecosystem for AI and data processing. |
| **Web Framework** | **FastAPI 0.110+** | Modern, high-performance async ASGI framework with automatic OpenAPI documentation and native Pydantic validation. |
| **ASGI Server** | **Uvicorn** | Fast ASGI web server running with uvloop and httptools. |
| **Data Validation & Schemas** | **Pydantic v2** | Blazing-fast Rust-based validation core. Enforces strict input validation, character limits, and serialized response payloads. |
| **Environment Configuration** | **Pydantic-Settings** | Type-safe settings management (`BaseSettings`) that reads `.env` locally and OS environment variables in production. |
| **AI SDK** | **`google-genai` (Official SDK)** | The official Google GenAI SDK (`from google import genai`) for interacting with Gemini models and Google Search Grounding tools. |
| **Rate Limiting** | **`slowapi`** | In-memory token bucket rate limiter (10 requests/min per IP) to prevent DoS attacks and API quota exhaustion without requiring an external Redis instance. |
| **HTTP & Test Client** | **`httpx`** | Async HTTP client for integration testing FastAPI endpoints. |
| **Hosting Platform** | **Render (Web Service)** | Managed container service, seamless Docker/Python build pipelines, automatic HTTPS, and secure server-side environment variables. |

---

## 3. Deployment & Infrastructure Stack

```
+-------------------------------------------------------------+
|                     TRUTHLENS STACK                         |
+------------------------------+------------------------------+
| Frontend (Vercel)            | Backend (Render)             |
| - Node.js 20 build runtime   | - Python 3.11 runtime        |
| - Vite + React 18 + TS       | - FastAPI + Uvicorn          |
| - Vanilla CSS design system  | - google-genai SDK           |
| - Global Edge CDN            | - slowapi rate limiter       |
| - Domain: truthlens.vercel.app| - Domain: truthlens.onrender |
+------------------------------+------------------------------+
| Integration Layer                                           |
| - HTTPS REST Protocol (JSON)                                |
| - Strict CORS Policy (Only Vercel domain permitted)          |
| - Zero client-side API secrets                              |
+-------------------------------------------------------------+
```

---

## 4. Development & Code Quality Tools

- **Package Managers**:
  - Frontend: `npm` (pinned in `package-lock.json`)
  - Backend: `pip` / `requirements.txt` (pinned package versions)
- **Formatting & Linting**:
  - Python: `flake8` / `black` compatible standards
  - TypeScript: ESLint with TypeScript rules, `tsc --noEmit`
- **Testing**:
  - Backend: `pytest` + `pytest-asyncio` + `httpx` for API testing
  - Frontend: React component tests & dev-browser validation

---

## 5. Explicitly Prohibited Technologies

Per `rules.md` and project requirements, the following are strictly disallowed:
- **Tailwind CSS**: Banned in favor of vanilla CSS tokens for exact aesthetic control.
- **Untouched shadcn/ui**: Banned in favor of custom-tailored forensic inspection components.
- **Client-Side Google AI SDKs**: Banned for security; all AI calls must be proxied through FastAPI.
- **Heavy UI Frameworks (Material UI, Ant Design)**: Banned due to bundle bloat and generic visual styles.
