# Security & Dependency Hygiene Audit — CAR-205

_Date: 2026-06-26 · Auditor: Security Engineer · Scope: full product (client code, build, deps, CI)_
_Recurring quality pass. Prior passes: [CAR-189](./security-audit-CAR-189.md) (2026-06-26), [CAR-168](./security-audit-CAR-168.md) (2026-06-26), [CAR-149](./security-audit-CAR-149.md) (2026-06-25), [CAR-126](./security-audit-CAR-126.md) (2026-06-25), [CAR-91](./security-audit-CAR-91.md) (2026-06-23)._

## Threat model (re-confirmed)

- **Fully client-side, single-player browser game** (vanilla JS, Vite 5 build), shipped as a
  **static site**. No backend, no server, no dev server in production.
- **SSRF / server-side redirects / CORS are N/A** — there is no server to make outbound
  requests or set CORS headers. No `fetch`/`XMLHttpRequest`/`WebSocket`/`postMessage` anywhere
  in `game.js` (grep-confirmed this pass).
- **No auth, accounts, PII, or secrets.** Player state lives only in the user's own
  `localStorage` (`SAVE_KEY`, `collapsedSections`, `gameDifficulty`); tampering is
  **self-XSS only**, not a cross-user vector. No `document.cookie`.

Attack surface is very small. **Headline: no new actionable findings; zero production-dependency
vulnerabilities; build is green. The only real dependency items are dev-server-only and already
tracked by open [CAR-48](https://…). No new fix-issues filed.**

## What changed since the last pass (CAR-189)

Diff `23bedf4..HEAD` (3 code commits; the rest are docs):

| Commit | Change | Security surface | Verdict |
|---|---|---|---|
| `d7c7200` | feat(launch): difficulty descriptions + stat deltas (CAR-163) | New launch-screen render in `index.html` inline script | **Safe.** Uses `descEl.textContent = mode.description`, then `createElement` + `textContent` for each stat label/value (`index.html:185–198`). No `innerHTML` interpolation; data is static `DIFFICULTY_MODES`. |
| `27db663` | fix(game): keep re-entry controls after dismissing endgame modal (CAR-198) | Modal control flow | **Safe.** No new sink; static `<a href="index.html">` + `window.location.reload()`. |
| `296eb02` | feat(map): error/fallback when world-map SVG fails to load (CAR-100) | `#map-error` overlay + `<object>` fallback in `game.html` | **Safe.** Driven by `getElementById` + class toggles; map loads via `<object data="…same-origin static .svg">`, no remote fetch, no `innerHTML`. |

The long-standing invariant holds: **every one of the 68 `innerHTML` sites interpolates only
numeric/enum game state** (`.toFixed()`, integer counts, `formatCurrency`). No user- or
URL-derived string reaches any HTML sink.

## Checks run this pass

- **`npm audit --omit=dev` → 0 vulnerabilities.** The production static build ships no
  vulnerable code.
- **`npm audit` (full) → 2 dev-only advisories** in the Vite 5 toolchain:
  - `esbuild ≤0.24.2` — moderate, GHSA-67mh-4wv8-2f99 (dev server reads cross-site responses).
  - `vite ≤6.4.2` — **high, "Path Traversal in Optimized Deps `.map` handling"** _(newly surfaced
    since CAR-189; also a `vite dev`-server-only issue)._
  - **Both clear with the same Vite 5→latest major bump already tracked by open CAR-48.** Added a
    note to CAR-48 so its scope reflects the additional high advisory. Not re-filed (don't-re-file
    guardrail). Neither affects the shipped static build.
- **Dangerous-sink grep** (`eval` / `new Function` / `document.write` / `insertAdjacentHTML` /
  `outerHTML`) → **none present.**
- **Network/exfil grep** (`fetch`/`XHR`/`WebSocket`/`postMessage`/`cookie`) → **none present.**
- **CSP re-verified** in `index.html` and `game.html` (defense-in-depth, from earlier passes):
  `default-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'; connect-src 'self'`,
  `img/font-src 'self' data:`. Restrictive and intact. Residual `script-src/style-src 'unsafe-inline'`
  is required by the inline launch script and is **defense-in-depth only** given there is no
  untrusted-data path to inline injection; not worth churning the inline bootstrap. (Unchanged
  from prior passes — not a new finding.)
- **`npm run build` → green** (`✓ built in 375ms`).

## Disposition

**Done. No new fix-issues warranted.** All concrete dependency work is already tracked by open
**CAR-48** (Vite upgrade); CSP hardening (`unsafe-inline`) is the only standing residual and is
low-value defense-in-depth for a credential-free static client game. Re-filing either would
violate the don't-re-file guardrail.
