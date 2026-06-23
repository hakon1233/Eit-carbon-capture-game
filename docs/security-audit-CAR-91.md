# Security & Dependency Hygiene Audit — CAR-91

_Date: 2026-06-23 · Auditor: Security Engineer · Scope: full client-side product_

## Context / threat model

This product is a **fully client-side, single-player browser game** (vanilla JS,
Vite build) deployed as a **static site to GitHub Pages**. There is:

- **No backend / server** → SSRF, server-side redirects, and CORS are **not applicable**.
- **No network calls** — zero `fetch` / `XMLHttpRequest` / `WebSocket` / `sendBeacon`
  in the app. No external/CDN resources are loaded (all CSS/JS/SVG/fonts are bundled
  same-origin; Vite inlines small assets as `data:` URIs).
- **No secrets** — no API keys, tokens, passwords, or credentials in the repo or build.
- **No auth, accounts, or user-identifiable data.** State lives only in the player's
  own `localStorage`.

The attack surface is therefore very small. The honest headline: **no
high-severity vulnerabilities found.** The findings below are defense-in-depth and
dependency-hygiene items.

## Prioritized findings

### 1. [Hardening — FIXED this pass] No Content-Security-Policy / security meta tags
The two app entry pages (`index.html`, `game.html`) shipped with no CSP. While no XSS
sink is currently reachable (see §3), a CSP is cheap insurance: if a future change ever
introduces an injection, a `default-src 'self'` policy prevents the injected code from
**exfiltrating data to or loading payloads from an external origin**, and blocks
`<base>`-tag hijacking.

**Fix applied** — added to both `index.html` and `game.html`:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;
  connect-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'
referrer: strict-origin-when-cross-origin
```
Notes on the policy shape (each value was verified against the built `dist/`):
- `'unsafe-inline'` is **required** — the app uses inline `<script>` (launch logic in
  `index.html`) and ~18 generated inline `on*=` handlers + inline `style=` attributes.
  A nonce/hash-based strict CSP would be a much larger, riskier refactor; deferred.
- `img-src`/`font-src` include `data:` because Vite inlines small SVGs and `.ttf` fonts
  as `data:` URIs at build time.
- `object-src 'self'` (not `'none'`) — the **world map loads via
  `<object data="assets/maps/…svg">`**; `'none'` would break the core map UI.
- `connect-src 'self'` — the app makes no network requests, so this closes the
  exfiltration channel entirely while remaining future-safe.

**Verified:** `npm run build` green; headless-Chrome load of both built pages shows
**zero CSP violations**, launch screen and `map-object` render correctly.

### 2. [Low — dev-only] esbuild/Vite advisory GHSA-67mh-4wv8-2f99
`npm audit` reports `esbuild <=0.24.2` (via `vite@5.4.21`). The advisory lets any
website send requests to the **Vite dev server** and read responses — it affects
`vite dev` on a developer's machine only. It is **not present in the production static
build** (GitHub Pages serves pre-built static files; no dev server runs). The only
non-breaking remediation path is a **major upgrade to Vite 7+**, which is a breaking
change and out of scope for a small reversible security fix. Tracked as a low-priority
follow-up for the Repo Maintainer rather than force-bumped here.

### 3. [Info — no action] Input handling / XSS surface is clean
- 67 `innerHTML` writes exist, but every interpolated value is **numeric game state**
  (`toFixed(...)`, ratios, counts) — no free-text user input reaches a sink.
- The only text-ish form control is a single `<input type="number">`.
- **No save import/export, no `FileReader`, no URL/query/hash parsing**, no `atob`.
  Save data is read only from the player's own `localStorage` via `JSON.parse` inside a
  `try/catch`. Tampering requires DevTools access to one's own browser → **self-XSS
  only**, not a cross-user vector.
- No `eval`, `new Function`, or `document.write`.

### 4. [Info — platform-limited] Header-only protections not settable on GitHub Pages
`X-Frame-Options` / CSP `frame-ancestors` (clickjacking) and `X-Content-Type-Options`
require HTTP response headers, which GitHub Pages does not let you set, and which
browsers ignore when delivered via `<meta>`. Given the game has no authenticated or
state-changing-on-behalf-of-user actions, clickjacking risk is negligible. Documented
for awareness; revisit if the app ever moves to a host with header control.

## Disposition
- §1 fixed and committed this pass.
- §2 → low-priority follow-up issue for the Repo Maintainer (controlled Vite 7 upgrade).
- §3, §4 → informational, no action.
