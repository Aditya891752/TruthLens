# TruthLens: AI Engineering & Implementation Rules (`rules.md`)

This document defines the strict, non-negotiable operational, aesthetic, architectural, and security constraints for TruthLens. Any AI assistant, developer, or automated pipeline working on this codebase must adhere strictly to every rule listed below.

---

## 1. The Three Highest-Risk Fixes First (Priority Zero)

Before any code deployment or feature release, verify these three critical security vulnerabilities:

### 1. Leakage of Server Secrets & Gemini API Keys in Frontend/Client Bundles
* **Risk**: Complete compromise of Google Cloud / Gemini API credentials, quota exhaustion, unauthorized billing, and full data exposure.
* **Non-Negotiable Rule**:
  - The Gemini API key (`GEMINI_API_KEY`) and any server environment variables must **NEVER** appear in frontend code, Vite configs (`VITE_` prefix must never expose raw backend secrets), client-side JavaScript, or bundled assets.
  - All LLM invocations and Google Search Grounding calls must run strictly inside the backend FastAPI server.
  - The client only communicates with the backend via authenticated/cors-restricted FastAPI endpoints (`/api/analyze`).
* **Verification**: Run `grep -rn "GEMINI_API_KEY" frontend/` and inspect compiled client bundles for any accidental environment variable inlining.

### 2. Public Exposure or Git Commitment of `.env` and Secret Credentials
* **Risk**: Immediate credential scraping by automated bots on GitHub/GitLab, persistent compromise in git history.
* **Non-Negotiable Rule**:
  - `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key`, and service account JSONs are permanently listed in `.gitignore` from commit #0.
  - Only `.env.example` with blank placeholder values (`GEMINI_API_KEY=your_gemini_api_key_here`) is allowed in source control.
  - Git history must remain 100% clean of all secrets at all times.
* **Verification**: Automated pre-commit checks and `.gitignore` auditing before any git push.

### 3. Missing Rate Limiting, Input Abuse & Lack of Backend Validation
* **Risk**: Denial of Service (DoS), massive API billing spikes via spamming large text payloads to the Gemini API, server resource exhaustion.
* **Non-Negotiable Rule**:
  - FastAPI must enforce strict request payload size limits (maximum 15,000 characters per analysis request).
  - Rate limiting middleware (e.g., slowapi or token-bucket limiter) must guard `/api/analyze` (e.g., max 10 requests/minute per IP).
  - Pydantic models must validate, sanitize, and strip malicious inputs before any processing.
* **Verification**: Automated load tests and input validation integration tests.

---

## 2. Comprehensive Security Checklist (All 12 Cardinal Rules)

1. **NO API keys or secrets in frontend or client JS**: All AI logic, API keys, and search mechanisms reside exclusively in the FastAPI backend.
2. **NO `.env` or config files exposed publicly or committed**: Strict `.gitignore` enforcement; never serve `.env` through static file mounts or public directory routing.
3. **NO secrets anywhere in git history**: If a secret is ever accidentally staged or committed, it must be rotated immediately and purged via `git filter-repo` / BFG.
4. **NO overly permissive database rules**: Any database, cache (Redis), or persistence layer must have strict RLS, authentication, and minimal privilege policies. World-readable access is prohibited.
5. **NO public storage buckets**: Any object storage (S3, GCS, Supabase Storage) must have public access prevention enabled; assets require short-lived pre-signed URLs.
6. **Rate limiting on APIs and auth endpoints**: All public endpoints must have rate limiting enabled by default.
7. **NO debug mode or dev tools enabled in production**: `debug=True` in FastAPI, Uvicorn reload, Swagger/OpenAPI docs exposed publicly without protection, or React dev-tools in production are prohibited in production builds.
8. **NO admin routes reachable without auth**: Admin, debug, or internal metrics routes must require robust cryptographic token authentication.
9. **NO SQL or NoSQL injection via unsanitized input**: Use parameterized ORMs (SQLAlchemy / SQLModel) or strict Pydantic schemas. Raw string concatenation in queries is banned.
10. **NO passwords stored in plain text or with weak hashing**: If user authentication is added, use Argon2id or bcrypt with high work factor.
11. **NO stack traces or internal errors shown to users**: Production API error responses must return sanitized error payloads (e.g. `{"detail": "Analysis request could not be processed"}`) while logging full tracebacks securely to server-side logs.
12. **NO auth checks that only exist client-side**: Client-side UI routing guards are strictly for UX; every API endpoint must independently verify authorization tokens on the server.

---

## 3. Strict Aesthetic & UI Negative Constraints

To ensure TruthLens feels like a serious, high-precision forensic instrument rather than a generic template, the following patterns are **STRICTLY FORBIDDEN**:

| Category | Forbidden Pattern (DO NOT USE) | Mandatory Alternative |
|---|---|---|
| **Color & Gradients** | Purple to blue gradient (`linear-gradient(purple, blue)`) | Sharp, monochrome slate/dark canvas (`#090A0F`, `#12151E`) with crisp semantic accents (Emerald `#10B981`, Amber `#F59E0B`, Crimson `#EF4444`). |
| **Typography** | Gradient hero text | High-contrast solid typography with crisp letter-spacing and hierarchy. |
| **Headings** | Emojis in headings (e.g. `## 🔍 Analysis`) | Professional, clean typographic labels without emoji clutter. |
| **Fonts** | Inter font everywhere | Specialized editorial & technical typography: `Plus Jakarta Sans` or `IBM Plex Sans` for UI, `JetBrains Mono` for code & claim IDs. |
| **Fonts** | Space Grotesk + Instrument Serif | Cohesive, purpose-built modern technical type family. |
| **Fonts** | Serif italic accents in UI copy | Crisp sans-serif or monospace weights. |
| **Cards & Surfaces** | Colored border cards (e.g. neon blue/purple border lines) | Subtle, neutral, high-contrast borders (`#1F2432`, `1px solid rgba(255,255,255,0.08)`). |
| **Cards & Surfaces** | Glassmorphism cards (`backdrop-filter: blur()`, semi-transparent frosted glass) | Solid, clean, opaque surface levels (`#12151E`, `#181C28`) with crisp elevation and borders. |
| **Color Contrast** | Low-contrast dark mode (washed-out gray on dark gray) | Strict WCAG AAA/AA high contrast (`#F1F3F9` text on `#090A0F` background, minimum 7:1 contrast ratio). |
| **Layouts** | 3 icon boxes in a row (generic marketing SaaS style) | Dense, information-rich forensic dashboard grid: Input workbench, verification metrics strip, claims stream, source inspector. |
| **Headers** | Badge above the headline (e.g. pill "✨ Powered by AI 2.0") | Clean, functional application header with title, status indicator, and engine version. |
| **Icons** | Lucide icons everywhere / icon overload | Restrained, functional SVG icons used only where they clarify actions (filter, link, copy, expand). |
| **UI Kits** | Untouched shadcn UI clones | Bespoke, custom-crafted CSS components tailored to fact-checking and text forensics. |
| **Motion** | Fade in on scroll | Instant, responsive content rendering without artificial scroll lag. |
| **Motion** | Cursor-following beam or spotlight glow | Static, clean workspace free of distracting visual gimmicks. |
| **Motion** | Button fades on hover | Fast, snappy micro-transitions (`transition: background 150ms ease-in-out`, discrete active state). |
| **Spacing** | Inconsistent spacing | Strict 4px/8px grid system (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`). |
| **Copywriting** | Em dashes everywhere (`—`) | Direct, concise, technical copywriting. |
| **Backgrounds** | Grain over a gradient | Deep solid background surfaces or subtle subtle micro-grid canvas. |
| **Credentials** | Generic passwords (e.g. `password123`, `admin`) in fixtures or docs | Cryptographically generated placeholder tokens. |

---

## 4. Verification & Enforcement Protocol

1. **Before any code change**: Review changes against Section 1 & Section 3.
2. **Before deployment to Render / Vercel**:
   - Check environment variable security isolation.
   - Run production build with zero compiler warnings and strict type checking.
   - Audit frontend bundle for missing or leaked secrets.
