# Security & Dependency Hygiene Audit — CAR-126

_Date: 2026-06-25 · Auditor: Security Engineer · Scope: full client-side product_
_Recurring quality pass. Prior pass: [CAR-91](./security-audit-CAR-91.md) (2026-06-23)._

## Context / threat model

Unchanged from CAR-91 and re-verified independently this pass (the prior doc predates the
latest `game.js`, so claims were re-checked against current source rather than trusted):

- **Fully client-side, single-player browser game** (vanilla JS, Vite 5 build), deployed
  as a **static site to GitHub Pages**. No backend, no dev server in production.
- **SSRF / server-side redirects / CORS are N/A** — there is no server.
- **Zero network calls** — re-verified: no `fetch` / `XMLHttpRequest` / `WebSocket` /
  `sendBeacon` in `game.js`, `index.html`, or `game.html`. No external/CDN origins.
- **No secrets** — no API keys/tokens/passwords/credentials in repo or build.
- **No auth, accounts, or PII.** State lives only in the player's own `localStorage`.

The attack surface is very small. **Headline: no new actionable findings; no
high-severity vulnerabilities.** Everything material is already fixed or already tracked.

## Re-verification results (current source)

| Check | Method | Result |
| --- | --- | --- |
| Network exfiltration channel | grep `fetch`/XHR/`WebSocket`/`sendBeacon` | none |
| Code-exec sinks | grep `eval`/`new Function`/`document.write`/`atob` | none |
| URL/route-controlled input | grep `location.hash`/`location.search`/`URLSearchParams` | none |
| File import | grep `FileReader`/`readAsText` | none |
| Free-text input → DOM | grep `type="text"`/`contenteditable`/`<textarea>`/`prompt(` | none (only `type="button"` + one `type="number"`) |
| `innerHTML` string interpolation | grep 67 sinks for `.name`/`.label`/`.title`/`.text`/`.id` | none — interpolated values are numeric game state |
| `localStorage` load hardening | read `loadGame`, `getCollapsedSections`, `loadDifficulty` | all guarded by `try/catch` or allow-listed (`DIFFICULTY_MODES[saved]`) |
| Production build | `npm run build` | green |

The `innerHTML` surface and `localStorage` handling remain as CAR-91 described: tampering
with one's own `localStorage` is **self-XSS only**, not a cross-user vector, and the
`default-src 'self'` CSP added in CAR-91 (present in both `index.html` and `game.html`)
contains even that.

## Prioritized findings

### 1. [Low — dev-only, ALREADY TRACKED] Vite/esbuild dev-server advisories
`npm audit` reports advisories on `vite@5.4.21` / its bundled `esbuild`. Since CAR-91 the
set has **grown** from one advisory to four — all still **dev-server-only**:

| Advisory | Title |
| --- | --- |
| GHSA-67mh-4wv8-2f99 | esbuild dev server accepts cross-origin requests (moderate) |
| GHSA-4w7w-66w2-5vf9 | Vite path traversal in optimized-deps `.map` handling (moderate) |
| GHSA-v6wh-96g9-6wx3 | launch-editor NTLMv2 hash disclosure via UNC path, Windows (moderate) |
| GHSA-fx2h-pf6j-xcff | Vite `server.fs.deny` bypass on Windows alternate paths (high) |

**Production impact: none.** All four affect only `vite dev` / `vite preview` on a
developer's machine. GitHub Pages serves the pre-built static `dist/`; no Vite server runs
in production. The single remediation is a major Vite upgrade (→ 7+), a breaking change
out of scope for a small reversible security fix.

**Disposition: do not re-file.** Already tracked by open issues **CAR-48** and **CAR-107**
(both "Upgrade Vite to clear the esbuild/dev-server advisory"). This pass simply
**strengthens the case** for that upgrade: it now clears 4 advisories, not 1. Housekeeping
note for the Repo Maintainer: CAR-48 and CAR-107 are duplicates of each other and could be
consolidated when the upgrade is scheduled.

### 2. [Info — no action] Header-only protections unavailable on GitHub Pages
`X-Frame-Options` / CSP `frame-ancestors` / `X-Content-Type-Options` need real HTTP
response headers, which GitHub Pages does not allow and which browsers ignore via `<meta>`.
The game has no authenticated or state-changing-on-behalf-of-user actions, so clickjacking
risk is negligible. Unchanged from CAR-91 §4.

## Disposition
- **No new fix-issues opened** — the one real dependency item is already tracked
  (CAR-48 / CAR-107) and is dev-only; everything else is fixed (CSP, CAR-91) or
  informational.
- Attack surface re-verified clean against the current `game.js`; build green.
- Recommendation to Repo Maintainer: consolidate CAR-48 + CAR-107 and treat the Vite
  upgrade as the single outstanding hygiene action (now clearing 4 advisories).
