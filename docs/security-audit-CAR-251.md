# Security & Dependency Hygiene Audit — CAR-251

_Date: 2026-06-27 · Auditor: Security Engineer · Scope: full product (client code, build, deps, CI)_
_Recurring quality pass. Immediately prior: [CAR-233](./security-audit-CAR-233.md) (2026-06-26). Earlier: [CAR-205](./security-audit-CAR-205.md), [CAR-189](./security-audit-CAR-189.md), [CAR-168](./security-audit-CAR-168.md), [CAR-149](./security-audit-CAR-149.md), [CAR-126](./security-audit-CAR-126.md), [CAR-91](./security-audit-CAR-91.md)._

## Headline

**One new low-severity finding, fixed in this pass.** Added `rel="noopener noreferrer"`
to 14 external `target="_blank"` links across the two deployed data-reference pages
(reverse-tabnabbing + referrer leak hardening). **Zero dependency vulnerabilities**
(`npm audit` full → 0, the dev-only Vite/esbuild advisory cleared by the now-landed Vite 8
bump). Build green. No new fix-issues filed — the only remaining tracked item is the
backlog CSP defense-in-depth issue.

## Threat model (re-confirmed)

- Fully client-side, single-player **static browser game** (vanilla JS, Vite 8 build).
  No backend, no server, no runtime network calls → **SSRF / server redirects / CORS are N/A.**
- **No auth, accounts, PII, or secrets.** Player state lives only in the user's own
  `localStorage` (`carbonCaptureGameSave`), parsed inside try/catch. Tampering is self-XSS
  only, not a cross-user vector.
- **No URL-param / hash / query parsing, no free-text inputs, no file import** → no
  attacker-controlled string reaches any sink. The ~66 `innerHTML` sites interpolate only
  numeric/enum game state (`.toFixed()`, integer counts, fixed region keys).

## Checks run this pass

| Check | Result |
|---|---|
| `npm audit` (full) | **0 vulnerabilities** — production deps: none (all deps are dev/build/lint/test tooling) |
| Dangerous sinks: `eval` / `new Function` / `document.write` / `insertAdjacentHTML` / `outerHTML` | **none present** |
| Network/exfil: `fetch` / `XHR` / `WebSocket` / `postMessage` / `cookie` | **none** |
| Secrets: `api[_-]?key` / `secret` / `token` / `password` / `bearer` | **none in source** |
| User-input sources: URL params / hash / `FileReader` / free-text inputs | **none** |
| CI workflow (`.github/workflows/deploy.yml`) | **safe** — `push:[main]` + `workflow_dispatch` only (no `pull_request_target`), least-privilege `permissions` (`contents:read`, `pages:write`, `id-token:write`), pinned official actions |
| `npm run build` | **green** (`✓ built in 196ms`) |

## Findings

### F1 — `target="_blank"` without `rel="noopener noreferrer"` (Low) — FIXED

Both deployed reference pages opened 14 external links (IPCC, IEA, IRENA, World Bank,
Our World in Data, NOAA, NREL, Wikipedia, etc.) with `target="_blank"` and no `rel`:

- `Game_Data_Reference.html` — 10 links
- `Emissions_Data_Reference.html` — 4 links

Risk: legacy reverse-tabnabbing (opened page could `window.opener.location` the source tab)
and unnecessary `Referer` leakage to third-party sites. Modern browsers imply `noopener` for
`target="_blank"`, so severity is **low** — but `rel="noopener noreferrer"` is the explicit
best practice and also covers older engines and referrer privacy.

**Fix applied this pass:** added `rel="noopener noreferrer"` to all 14 anchors. Verified
0 bare `target="_blank">` remain, the attribute is present in the built `dist/` output, and
`npm run build` stays green. Small and fully reversible (HTML-attribute-only, no logic change).

## Already-tracked (not re-filed — don't-re-file guardrail)

- **CSP** — `[security] Add a restrictive Content-Security-Policy…` (backlog). Low-value
  defense-in-depth for a credential-free static client game; the inline launch bootstrap +
  inline event handlers/styles require `'unsafe-inline'`, so a strict CSP needs real refactor
  work, not a quick fix. Left as-is.
- **Vite 5→latest / esbuild advisory** — `[security] Upgrade Vite 5 → latest…` (in_review,
  CAR-48). The bump has landed (`package.json` now `vite ^8.1.0`); full `npm audit` is clean.
- **npm audit dev-dep advisories** — prior `[security] npm audit fix…` (done).

## Disposition

**Done.** One concrete low-severity hardening applied and verified (F1). No new fix-issues
warranted: dependency hygiene is clean, the only open defense-in-depth item (CSP) is already
tracked in backlog, and the Vite advisory is already in review. Re-filing any of these would
violate the don't-re-file guardrail.
