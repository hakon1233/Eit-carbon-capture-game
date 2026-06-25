# Security & Dependency Hygiene Audit — CAR-149

_Date: 2026-06-25 · Auditor: Security Engineer · Scope: full product (client code, CI, build, deps)_
_Recurring quality pass. Prior passes: [CAR-126](./security-audit-CAR-126.md) (2026-06-25), [CAR-91](./security-audit-CAR-91.md) (2026-06-23)._

## Threat model (re-confirmed against current source)

- **Fully client-side, single-player browser game** (vanilla JS, Vite 5 build), shipped as a
  **static site to GitHub Pages**. No backend, no server, no dev server in production.
- **SSRF / server-side redirects / CORS are N/A** — there is no server to make requests or
  set CORS headers.
- **No auth, accounts, PII, or secrets.** Player state lives only in the user's own
  `localStorage`. Tampering with it is **self-XSS only**, not a cross-user vector.

Attack surface is very small. **Headline: no new actionable findings; no high-severity
vulnerabilities. Build, the one tracked dep item, and CI are all in the expected state.**

## What was checked this pass (independent verification, not trusted from prior docs)

| Check | Method | Result |
| --- | --- | --- |
| Network exfiltration / call channel | grep `fetch(`/`XMLHttpRequest`/`WebSocket`/`sendBeacon` in `game.js`+HTML | **none** |
| Code-exec sinks | grep `eval(`/`new Function`/`document.write`/string `setTimeout`/`setInterval` | **none** |
| Secrets in source/config | grep api-key/secret/password/token/bearer/aws_/private-key across `game.js`, HTML, `vite.config.js` | **none** |
| CSP present & restrictive | read meta CSP in `index.html` + `game.html` | present, identical, restrictive (see below) |
| `vite.config.js` | read full config | clean — no exposed `server.host`/proxy/`fs.allow` widening |
| CI workflow hardening | read `.github/workflows/deploy.yml` | least-privilege `permissions`; `push`+`workflow_dispatch` only (no `pull_request_target`); no secrets consumed |
| Build artifacts in VCS | `git ls-files dist/ node_modules/` | **0 tracked** — both correctly `.gitignore`d |
| Production build | `npm run build` | **green** (built in ~0.8s) |
| Dependency advisories | `npm audit` | 2 advisories, **both dev-only**, already tracked (see Finding 1) |

CSP value (both pages, verbatim):
`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'`

## Prioritized findings

### 1. [Low — dev-only, ALREADY TRACKED, do not re-file] Vite/esbuild dev-server advisory
`npm audit` reports the esbuild dev-server advisory **GHSA-67mh-4wv8-2f99** (moderate) plus a
high flagged on the bundled `vite` chain. **Production impact: none** — these affect only
`vite dev`/`vite preview` on a developer's machine; GitHub Pages serves the pre-built static
`dist/`, where no Vite server runs. The fix is a major Vite upgrade (5 → 8, breaking),
out of scope for a small reversible change.
**Disposition: already tracked by open issues CAR-48 and CAR-107** (duplicates of each
other). Not re-filed.

### 2. [Info — no action] `script-src 'unsafe-inline'` and `object-src 'self'`
The CSP allows `'unsafe-inline'` for scripts/styles (the game relies on inline handlers and
styles) and sets `object-src 'self'` rather than `'none'`. These are defense-in-depth nits,
not vulnerabilities: there is no user-/URL-controlled input reaching a DOM sink (re-verified
in CAR-126: all `innerHTML` interpolations are numeric game state), and the page embeds no
`<object>`/`<embed>`. Removing `'unsafe-inline'` would be a large, behavior-risking change
for negligible gain on a single-player static game. **No issue filed.**

### 3. [Info — no action] Header-only protections unavailable on GitHub Pages
`X-Frame-Options` / CSP `frame-ancestors` / `X-Content-Type-Options` require real HTTP
response headers, which GitHub Pages does not serve and browsers ignore via `<meta>`. The
game has no authenticated or state-changing-on-behalf-of-user actions, so clickjacking risk
is negligible. Unchanged from CAR-91 §4 / CAR-126 §2.

## Disposition
- **No new fix-issues opened.** The single real dependency item is dev-only and already
  tracked (CAR-48 / CAR-107); CSP hardening is done (CAR-91); everything else is
  informational or N/A. Re-filing would violate the "don't re-file tracked items" guardrail.
- Attack surface, CI, build artifacts, and dependency posture independently re-verified clean
  against current source; build green.
- Housekeeping recommendation to Repo Maintainer (carried over from CAR-126): consolidate the
  duplicate CAR-48 + CAR-107 and treat the Vite upgrade as the single outstanding hygiene
  action.
