# Security & Dependency Hygiene Audit — CAR-219

_Date: 2026-06-26 · Auditor: Security Engineer · Scope: full product (client code, build, deps, CI)_
_Recurring quality pass. Prior passes: [CAR-205](./security-audit-CAR-205.md), [CAR-189](./security-audit-CAR-189.md), [CAR-168](./security-audit-CAR-168.md), [CAR-149](./security-audit-CAR-149.md), [CAR-126](./security-audit-CAR-126.md), [CAR-91](./security-audit-CAR-91.md)._

## Headline

**No new actionable findings. Zero production-dependency vulnerabilities. Build green.** The only
real dependency item remains the dev-server-only Vite 5→latest bump, already tracked by open
**[CAR-48](#)** (status `todo`). No new fix-issues filed (don't-re-file guardrail).

## Threat model (re-confirmed)

- Fully client-side, single-player **static browser game** (vanilla JS, Vite 5 build). No backend,
  no server, no dev server in production.
- **SSRF / server-side redirects / CORS are N/A** — no server to make outbound requests or set
  CORS headers. Grep this pass: no `fetch` / `XMLHttpRequest` / `WebSocket` / `postMessage` /
  `document.cookie` anywhere in `game.js`, `index.html`, `game.html`.
- **No auth, accounts, PII, or secrets.** Player state lives only in the user's own `localStorage`;
  tampering is self-XSS only, not a cross-user vector.

## What changed since the last pass (CAR-205, diff `2cc6dba..HEAD`)

Only one security-relevant code change; the rest are docs/UX:

| Commit | Change | Surface | Verdict |
|---|---|---|---|
| `1f5309d` | fix(game): wire power build-mode dialog so Replace Fossil is reachable (CAR-217) | New `showPowerBuildModeDialog` / `executeEffectivenessBuild` render path in `game.js:11528+` | **Safe.** `overlay.innerHTML` interpolates only `project.label` (static `PROJECT_TYPES` enum), `regionName` (static region data), `formatCurrency(cost)` and `.toFixed()` numerics. No user- or URL-derived string reaches the sink — consistent with the long-standing invariant. |
| `635c49b` | fix(game): guard effectMultiplier in hot-path project loops (CAR-207) | Numeric guard only | **Safe.** No new sink. |

The invariant holds: **every `innerHTML` site interpolates only numeric/enum game state**
(`.toFixed()`, integer counts, `formatCurrency`, static config labels).

## Checks run this pass

- **`npm audit --omit=dev` → 0 vulnerabilities.** Shipped static build has no vulnerable code.
- **`npm audit` (full) → 2 dev-only advisories** in the Vite 5 toolchain:
  - `esbuild ≤0.24.2` — moderate, GHSA-67mh-4wv8-2f99 (dev server reads cross-site responses).
  - `vite ≤6.4.2` — high, depends on the vulnerable esbuild.
  - Both clear with the same Vite 5→latest major bump already tracked by open **CAR-48**. Neither
    affects the shipped static build (no `vite dev` in production). Not re-filed.
- **Dangerous-sink grep** (`eval` / `new Function` / `document.write` / `insertAdjacentHTML` /
  `outerHTML`) → **none present.**
- **Network/exfil grep** (`fetch` / `XHR` / `WebSocket` / `postMessage` / `cookie`) → **none.**
- **`npm run build` → green** (`✓ built in 320ms`).

## Disposition

**Done. No new fix-issues warranted.** All concrete dependency work is tracked by open **CAR-48**.
The residual `script-src/style-src 'unsafe-inline'` CSP entry (required by the inline launch
bootstrap) remains low-value defense-in-depth for a credential-free static client game — unchanged
from prior passes, not a new finding. Re-filing either would violate the don't-re-file guardrail.
