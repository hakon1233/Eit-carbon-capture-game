# Security & Dependency Hygiene Audit — CAR-168

_Date: 2026-06-26 · Auditor: Security Engineer · Scope: full product (client code, build, deps, CI)_
_Recurring quality pass. Prior passes: [CAR-149](./security-audit-CAR-149.md) (2026-06-25), [CAR-126](./security-audit-CAR-126.md) (2026-06-25), [CAR-91](./security-audit-CAR-91.md) (2026-06-23)._

## Threat model (re-confirmed against current source)

- **Fully client-side, single-player browser game** (vanilla JS, Vite 5 build), shipped as a
  **static site**. No backend, no server, no dev server in production.
- **SSRF / server-side redirects / CORS are N/A** — there is no server to make outbound
  requests or set CORS headers.
- **No auth, accounts, PII, or secrets.** Player state lives only in the user's own
  `localStorage`; tampering with it is **self-XSS only**, not a cross-user vector.

Attack surface is very small. **Headline: no new actionable findings; no high- or
medium-severity vulnerabilities. The one real dependency item is dev-only and already
tracked; CSP is already in place; build is green.**

## What was checked this pass (independent verification — re-run against current source, not trusted from prior docs)

| Check | Method | Result |
| --- | --- | --- |
| Production dependency advisories | `npm audit --omit=dev` | **0 vulnerabilities** |
| All advisories (incl. dev) | `npm audit` | 2 advisories, **both dev-only** (esbuild ≤0.24.2 / vite ≤6.4.2 chain), already tracked — see Finding 1 |
| Network exfiltration / call channel | grep `fetch(`/`XMLHttpRequest`/`WebSocket`/`sendBeacon`/`import(` in `game.js` + HTML | **none** |
| Code-exec sinks | grep `eval(`/`new Function`/`document.write` | **none** |
| Secrets in source/config | grep api-key/secret/token/password/bearer/supabase/`sk-` across `game.js`, HTML | **none** |
| Free-text input → DOM sink | grep `<input type=text>`/`<textarea>`/`contenteditable`/`prompt(` | **none** — only numeric sliders/selects; all 67 `innerHTML` interpolations are internal game state (numeric / enum), several explicitly annotated as such |
| External / CDN origins | grep `https?://` + `<script>`/`<link>` in HTML | **none** — all assets same-origin; no SRI surface because no third-party scripts |
| CSP present & restrictive | read meta CSP in `index.html` + `game.html` | present, identical, restrictive (see below) |
| `localStorage` save/load robustness | read `loadGame()` / `saveGame()` in `game.js` | hardened — `JSON.parse` wrapped in `try/catch`, defensive field migrations, returns `false` on bad data (no crash, no sink) |
| Server component | grep `express`/`http.createServer`/`listen(` in `scripts/`, `runtime/`, root JS | **none** |
| Production build | `npm run build` | **green** (built in ~0.3s, exit 0) |

CSP value (both pages, verbatim):
`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'`

## Prioritized findings

### 1. [Low — dev-only, ALREADY TRACKED ×2, do not re-file] Vite/esbuild dev-server advisory
`npm audit` reports the esbuild dev-server advisory **GHSA-67mh-4wv8-2f99** (moderate) plus a
high flagged on the bundled `vite` chain. Installed: `vite@5.4.21`, `esbuild@0.21.5`.
**Production impact: none** — these affect only `vite dev` / `vite preview` on a developer's
machine; the deployed static `dist/` runs no Vite server (`npm audit --omit=dev` → 0). The fix
is a major Vite upgrade (5 → 8, breaking), out of scope for a small reversible change.
**Disposition: already tracked by two open issues — [CAR-48] (canonical, older) and [CAR-107]
(duplicate). Not re-filed.** This pass *acted on* the long-standing consolidation
recommendation: CAR-107 cancelled as a duplicate of CAR-48 (see Disposition).

### 2. [Info — no action] `script-src 'unsafe-inline'` and `object-src 'self'`
The CSP allows `'unsafe-inline'` for scripts/styles (the game relies on inline handlers and
styles) and sets `object-src 'self'` rather than `'none'`. Defense-in-depth nits, not
vulnerabilities: no user-/URL-controlled input reaches a DOM sink, and the page embeds no
`<object>`/`<embed>`. Removing `'unsafe-inline'` would be a large, behavior-risking refactor
for negligible gain on a single-player static game. **No issue filed.** (Unchanged from CAR-149 §2.)

### 3. [Info — no action] Header-only protections unavailable on a static host
`X-Frame-Options` / CSP `frame-ancestors` / `X-Content-Type-Options` require real HTTP
response headers, which a static `<meta>`-only deploy cannot set and browsers ignore via
`<meta>`. The game has no authenticated or state-changing-on-behalf-of-user actions, so
clickjacking risk is negligible. Unchanged from CAR-91 §4 / CAR-126 §2 / CAR-149 §3.

## Disposition
- **No new fix-issues opened.** The single real dependency item is dev-only and already
  tracked; CSP hardening is done (CAR-91); everything else is informational or N/A. Re-filing
  would violate the "don't re-file tracked items" guardrail.
- **Acted on carried-over housekeeping:** the duplicate Vite-upgrade pair (CAR-48 + CAR-107),
  flagged for consolidation in CAR-126 and CAR-149 but never actioned, is now consolidated —
  **CAR-107 cancelled as a duplicate of CAR-48**, leaving a single outstanding hygiene item.
- Attack surface, deps, secrets, network, CSP, save/load, and build independently
  re-verified clean against current source; build green. No product code changed.
