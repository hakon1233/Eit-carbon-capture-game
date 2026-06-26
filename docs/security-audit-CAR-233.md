# Security & Dependency Hygiene Audit — CAR-233

_Date: 2026-06-26 · Auditor: Security Engineer · Scope: full product (client code, build, deps)_
_Recurring quality pass. Immediately prior: [CAR-219](./security-audit-CAR-219.md) (same day). Earlier: [CAR-205](./security-audit-CAR-205.md), [CAR-189](./security-audit-CAR-189.md), [CAR-168](./security-audit-CAR-168.md), [CAR-149](./security-audit-CAR-149.md), [CAR-126](./security-audit-CAR-126.md), [CAR-91](./security-audit-CAR-91.md)._

## Headline

**No new actionable findings. Zero production-dependency vulnerabilities. Build green.**
The only real dependency item remains the dev-server-only Vite 5→latest bump, still tracked
by open **CAR-48** (`todo`). No new fix-issues filed (don't-re-file guardrail).

## What changed since CAR-219 (`c3a392c..HEAD`)

CAR-219 ran earlier today. Everything since is docs/UX bookkeeping — **no security-relevant
code change**:

| Commit | Change | Verdict |
|---|---|---|
| `b20b6d4` | docs(rules): correct win/lose conditions in `game_rules.html` | Static copy edit. No code. |
| `16b9136`, `840941b`/`a9792a5`, `31924e8` | docs: CAR-226 / CAR-234 / CAR-240 audit findings docs | Markdown only. |
| `c8ef4aa..7a4504c` in `game.js` | **+11 lines, JSDoc comment only** documenting `showPowerBuildModeDialog` (CAR-217) | No executable change — comment block. No new sink. |

The long-standing invariant holds: **every `innerHTML` site interpolates only numeric/enum
game state** (`.toFixed()`, integer counts, `formatCurrency`, static `PROJECT_TYPES`/region
labels). No user- or URL-derived string reaches any HTML sink.

## Threat model (unchanged, re-confirmed)

- Fully client-side, single-player **static browser game** (vanilla JS, Vite 5 build). No
  backend, no server, no dev server in production → **SSRF / server redirects / CORS are N/A.**
- **No auth, accounts, PII, or secrets.** Player state lives only in the user's own
  `localStorage`; tampering is self-XSS only, not a cross-user vector.

## Checks run this pass

- **`npm audit --omit=dev` → 0 vulnerabilities.** Shipped static build carries no vulnerable code.
- **`npm audit` (full) → 2 dev-only advisories** (`esbuild` GHSA-67mh-4wv8-2f99 moderate +
  transitive `vite` high). Both clear with the Vite 5→latest bump already tracked by open
  **CAR-48**. Neither affects the shipped static build. Not re-filed.
- **Dangerous-sink grep** (`eval` / `new Function` / `document.write` / `insertAdjacentHTML` /
  `outerHTML`) → **none present.**
- **Network/exfil grep** (`fetch` / `XHR` / `WebSocket` / `postMessage` / `cookie`) → **none.**
- **`npm run build` → green** (`✓ built in 294ms`).

## Disposition

**Done. No new fix-issues warranted.** All concrete dependency work is tracked by open
**CAR-48**. The residual `script-src/style-src 'unsafe-inline'` CSP entry (required by the
inline launch bootstrap) remains low-value defense-in-depth for a credential-free static
client game — unchanged from prior passes, not a new finding. Re-filing either would violate
the don't-re-file guardrail.
