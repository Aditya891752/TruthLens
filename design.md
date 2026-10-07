# TruthLens: Design System & UI/UX Specification (`design.md`)

This document defines the complete visual identity, design tokens, typography, layout hierarchy, and component specifications for TruthLens. Every design decision strictly enforces the negative constraints established in `rules.md`.

---

## 1. Design Philosophy: The Forensic Scientific Terminal

TruthLens is a precision instrument for detecting synthetic misinformation and AI hallucinations. Its visual language reflects rigorous forensic analysis, scientific clarity, and uncompromising contrast.

### Core Visual Directives:
- **High Information Density**: Information is organized into crisp, accessible tiers rather than bloated marketing cards.
- **Uncompromising High Contrast**: Deep dark canvas with bright, legible typography exceeding WCAG AAA standards.
- **Instant Responsiveness**: Snappy 100ms–150ms state transitions. Zero scroll-fade animations, zero glowing cursor beams, and zero laggy blur filters.
- **Negative Constraint Compliance**: Strictly adheres to the 19 negative design rules from `rules.md` (no purple-blue gradients, no glassmorphism, no gradient hero text, no emojis in headings, no Inter font everywhere).

---

## 2. Color System & Design Tokens

### 2.1 Surfaces & Neutrals (High-Contrast Obsidian Palette)
```css
:root {
  /* Canvas Backgrounds */
  --color-bg-base: #090A0F;         /* Deep obsidian workspace */
  --color-bg-surface-1: #12151E;    /* Primary panels & workbench */
  --color-bg-surface-2: #181C28;    /* Claim cards & inspection modules */
  --color-bg-surface-3: #212738;    /* Active states & input backgrounds */
  --color-bg-hover: #2A3247;        /* Snappy hover states */

  /* Structural Borders */
  --color-border-subtle: #1C2230;   /* Section separators */
  --color-border-default: #252B3B;  /* Card outlines & panel borders */
  --color-border-strong: #3B4459;   /* Focused inputs & active tabs */

  /* Typography Colors */
  --color-text-primary: #F1F3F9;    /* High-contrast crisp headlines & claims (7:1+ ratio) */
  --color-text-secondary: #94A3B8;  /* Supporting labels & descriptions */
  --color-text-muted: #64748B;      /* Offsets, character counts, metadata */
  --color-text-inverse: #090A0F;    /* Text on solid light badges */
}
```

### 2.2 Semantic Verification Palette
```css
:root {
  /* Supported / Grounded Truth (Emerald) */
  --color-supported-base: #10B981;
  --color-supported-bg: #064E3B;
  --color-supported-text: #A7F3D0;
  --color-supported-border: #059669;
  --color-supported-highlight: rgba(16, 185, 129, 0.18);

  /* Contradicted / Hallucination (Crimson) */
  --color-contradicted-base: #EF4444;
  --color-contradicted-bg: #450A0A;
  --color-contradicted-text: #FECACA;
  --color-contradicted-border: #DC2626;
  --color-contradicted-highlight: rgba(239, 68, 68, 0.22);

  /* Unverified / Insufficient Evidence (Amber) */
  --color-unverified-base: #F59E0B;
  --color-unverified-bg: #451A03;
  --color-unverified-text: #FDE68A;
  --color-unverified-border: #D97706;
  --color-unverified-highlight: rgba(245, 158, 11, 0.18);

  /* Forensic Action & Accent (Steel Cyan) */
  --color-accent-base: #0EA5E9;
  --color-accent-hover: #38BDF8;
  --color-accent-active: #0284C7;
  --color-accent-text: #E0F2FE;
}
```

---

## 3. Typography System

TruthLens deliberately avoids the overused `Inter` and `Space Grotesk + Instrument Serif` combinations.

- **Primary UI & Reading Font**: `Plus Jakarta Sans`, sans-serif (Clean geometric proportions, distinct letterforms, excellent screen legibility).
- **Technical & Monospace Font**: `JetBrains Mono`, monospace (Engine status, character counters, claim offsets, confidence percentages, source domains).

### Typographic Scale
| Token | Font Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--font-size-xs` | 12px (0.75rem) | 16px | 500 / 600 | Offsets, badge text, domain tags |
| `--font-size-sm` | 13px (0.8125rem) | 18px | 400 / 500 | Form inputs, metadata, source titles |
| `--font-size-md` | 14px (0.875rem) | 22px | 400 / 500 | Body text, claim card descriptions |
| `--font-size-lg` | 16px (1.0rem) | 24px | 500 / 600 | Section headers, card titles |
| `--font-size-xl` | 20px (1.25rem) | 28px | 600 | Panel titles, aggregate metrics |
| `--font-size-2xl`| 24px (1.5rem) | 32px | 700 | Application header title |

---

## 4. Layout Architecture: Forensic Workbench

The interface uses a functional two-column forensic layout on desktop, collapsing to an orderly single-column view on mobile screens.

```
+-------------------------------------------------------------------------+
| [Header] TRUTHLENS  |  v1.0-grounded  |  Backend: Connected [• Live]   |
+-------------------------------------------------------------------------+
|                                                                         |
|  LEFT COLUMN: Input & Control        RIGHT COLUMN: Verification Hub     |
|                                                                         |
|  +--------------------------------+  +--------------------------------+ |
|  | Preset Scenarios               |  | Metric Bar:                    | |
|  | [Subtle Error] [Severe] [True] |  | Truth Index: 78% | Risk: MOD   | |
|  +--------------------------------+  +--------------------------------+ |
|  | Input Text Area                |  | Annotated Text Viewer          | |
|  | (15,000 char max, character    |  | (Original text with clickable  | |
|  | counter, clear button)         |  | emerald, crimson, amber spans) | |
|  |                                |  +--------------------------------+ |
|  | [Analyze Factuality Button]    |  | Claims Stream (Filterable):    | |
|  +--------------------------------+  | [All (4)] [Contradicted (1)]   | |
|  | Engine Telemetry               |  | +----------------------------+ | |
|  | (Latency, Claims Extracted,    |  | | Claim 1 Card (Status/Cite) | | |
|  | Search queries conducted)      |  | +----------------------------+ | |
|  +--------------------------------+  +--------------------------------+ |
+-------------------------------------------------------------------------+
```

---

## 5. Component Specifications

### 5.1 Header Component
- Clean, non-distracting navigation bar.
- Title: `TRUTHLENS` in uppercase `Plus Jakarta Sans` bold, followed by a subtle monospace version tag (`v1.0`).
- Health indicator: Monospace status pill showing backend latency and connection status (`Engine: Online`).
- *Strictly NO emoji in header, NO badge pill floating above the headline.*

### 5.2 Input Workbench Component
- Solid background (`--color-bg-surface-1`) with crisp 1px border (`--color-border-default`).
- High-contrast textarea with subtle focus ring (`--color-border-strong`).
- Top bar with Quick Presets:
  - Button 1: "Subtle Hallucination"
  - Button 2: "Severe Hallucination"
  - Button 3: "Accurate Reference"
- Bottom bar displaying live character count (`324 / 15,000`) and the primary action button.
- Primary Action Button: High-contrast steel accent (`--color-accent-base`), solid color, instant 100ms active response. *NO gradient hero style, NO button fade on hover.*

### 5.3 Metric Bar Component
- Displays three core metric modules:
  1. **Truth Index**: Numerical percentage (`0%–100%`) with color-coded bar gauge.
  2. **Hallucination Risk**: Crisp status badge (`LOW`, `MODERATE`, `CRITICAL`).
  3. **Claim Tally**: Mini count breakdown (`[1 Supported] [2 Contradicted] [0 Unverified]`).
- *Strictly NO 3 icon boxes in a row; metrics are presented in an integrated telemetry strip.*

### 5.4 Annotated Text Viewer Component
- Renders the original analyzed text with exact character-level spans highlighted:
  - Supported claims: Underlined with emerald line + subtle emerald background tint (`--color-supported-highlight`).
  - Contradicted claims: Underlined with crimson line + crimson background tint (`--color-contradicted-highlight`).
  - Unverified claims: Underlined with amber dashed line + amber background tint (`--color-unverified-highlight`).
- Clicking or hovering any span instantly scrolls to and highlights the corresponding Claim Card in the right-hand stream.

### 5.5 Claim Card Component
- Solid surface (`--color-bg-surface-2`) with 1px neutral border (`--color-border-default`).
- Header: Claim ID (`#CLAIM-01`), Status Pill (`SUPPORTED` / `CONTRADICTED` / `UNVERIFIED`), and Confidence (`98%`).
- Body: Claim assertion text, followed by a concise forensic rationale box.
- Footer: Web Citations list. Each source is displayed as a clean pill with page title, domain tag (`wikipedia.org`), and external link icon.

---

## 6. Spacing Grid & Interaction Rules

- **Strict 4px/8px Spacing Grid**:
  - `4px` (tight padding, badge margins)
  - `8px` (button vertical padding, pill gaps)
  - `12px` (card internal padding)
  - `16px` (panel padding, standard gap)
  - `24px` (container margins, column gap)
  - `32px` (section separation)
- **Snappy Micro-Interactions**:
  - Hover states: `transition: background-color 120ms ease, border-color 120ms ease`.
  - Active states: `transform: scale(0.99)`.
  - Zero scroll-triggered fade animations; zero cursor follower effects.
