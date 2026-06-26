# Security & Dependency Hygiene Audit — CAR-189

_Date: 2026-06-26 · Auditor: Security Engineer · Scope: full product (client code, build, deps, CI)_
_Recurring quality pass. Prior passes: [CAR-168](./security-audit-CAR-168.md) (2026-06-26), [CAR-149](./security-audit-CAR-149.md) (2026-06-25), [CAR-126](./security-audit-CAR-126.md) (2026-06-25), [CAR-91](./security-audit-CAR-91.md) (2026-06-23)._

## Threat model (re-confirmed)

- **Fully client-side, single-player browser game** (vanilla JS, Vite 5 build), shipped as a
  **static site** (GitHub Pages). No backend, no server, no dev server in production.
- **SSRF / server-side redirects / CORS are N/A** — there is no server to make outbound
  requests or set CORS headers.
- **No auth, accounts, PII, or secrets.** Player state lives only in the user's own
  `localStorage`; tampering with it is **self-XSS only**, not a cross-user vector.

Attack surface is very small. **Headline: no new actionable findings; no high- or
medium-severity vulnerabilities. The one real dependency item remains dev-only and is
already tracked by open CAR-48. Build is green.**

## What changed since the last pass (CAR-168)

Diff `bd2e1eb..HEAD` touched `game.js` (+87), `game.html` (+24), `style.css`, scripts, docs.
The only product change with a security surface is the **endgame results modal**
(`feat(game): add endgame results modal`, c48d20c). It was reviewed line-by-line:

- **One new `innerHTML` assignment** (`summaryEl.innerHTML = \`…\``). All six interpolated
  values are internal numeric game state — `summary.finalTemperature.toFixed(2)`,
  `summary.yearReached`, `summary.finalCo2.toFixed(1)`, `summary.alliedRegions` /
  `totalRegions`, `summary.projectsBuilt`, and `formatCurrency(summary.endingTreasury)`.
  No user-supplied or URL-derived string reaches the sink. **Not an XSS vector** — consistent
  with the long-standing invariant that every `innerHTML` interpolation is numeric/enum.
- **One new navigation** (`window.location.href = "index.html"` on "Back to menu") — a static
  same-origin literal, not influenced by any input. Safe.

## Independent verification this pass (re-run against current source, not trusted from prior docs)

| Check | Method | Result |
| --- | --- | --- |
| Production dependency advisories | `npm audit --omit=dev` | **0 vulnerabilities** |
| All advisories (incl. dev) | `npm audit` | 2 advisories, **both dev-only** (esbuild ≤0.24.2 / vite ≤6.4.2 chain) — see Finding 1. (The rollup / fast-uri / postcss / js-yaml items from CAR-48's non-breaking sibling are **already resolved** — gone from the report.) |
| Code-exec sinks | grep `eval(` / `new Function` / `document.write` in `game.js` | **none** |
| Network exfiltration / call channel | grep `fetch(` / `XMLHttpRequest` / `WebSocket` / `sendBeacon` in `game.js` | **none** |
| Secrets in source | grep api-key/secret/token/password/bearer/supabase/`sk-…` in `game.js` | **none** |
| Free-text input → DOM sink | grep `type=text` / `<textarea>` / `contenteditable` / `prompt(` in HTML | **none** — only numeric sliders/selects |
| External / CDN origins | grep `https?://` + `<script>`/`<link>` in HTML | **none** — all assets same-origin |
| New code (endgame modal) | line-by-line review of `bd2e1eb..HEAD` game.js diff | clean — see section above |
| Production build | `npm run build` | **green** (built in ~0.5s, exit 0) |

## Prioritized findings

### 1. [Low — dev-only, ALREADY TRACKED, do not re-file] Vite/esbuild dev-server advisory
`npm audit` reports the esbuild dev-server advisory **GHSA-67mh-4wv8-2f99** (moderate) plus a
high flagged on the bundled `vite` chain. Installed: `vite@5.4.x`. **Production impact: none**
— these affect only `vite dev` / `vite preview` on a developer's machine; the deployed static
`dist/` runs no Vite server (`npm audit --omit=dev` → 0). The only fix is a breaking Vite
major upgrade (5 → 8), out of scope for a small reversible change.
**Disposition: tracked by open [CAR-48] (`todo`). Not re-filed.** (CAR-107, the former
duplicate, was cancelled in the CAR-168 pass.)

### 2. [Info — no action] `script-src 'unsafe-inline'` in CSP
The CSP allows `'unsafe-inline'` for scripts/styles (the game relies on inline handlers/styles).
A defense-in-depth nit, not a vulnerability: no user-/URL-controlled input reaches a DOM sink.
Removing it would be a large, behavior-risking refactor for negligible gain on a single-player
static game. **No issue filed.** (Unchanged from CAR-149 §2 / CAR-168 §2.)

### 3. [Info — no action] Header-only protections unavailable on a static host
`X-Frame-Options` / CSP `frame-ancestors` / `X-Content-Type-Options` require real HTTP response
headers, which a `<meta>`-only static deploy cannot set. The game has no authenticated or
state-changing-on-behalf-of-user actions, so clickjacking risk is negligible.
(Unchanged from CAR-91 §4 / CAR-168 §3.)

## Disposition

- **No new fix-issues opened.** The single real dependency item is dev-only and already tracked
  by open CAR-48; CSP hardening is done (CAR-91); everything else is informational or N/A.
  Re-filing would violate the "don't re-file tracked items" guardrail.
- **New code reviewed:** the endgame results modal added since CAR-168 introduces no new sink,
  network, secret, or input surface.
- Attack surface, deps, secrets, network, CSP, save/load, and build independently re-verified
  clean against current source; build green. **No product code changed this pass.**
