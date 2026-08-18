# Security & Dependency Hygiene Audit — CAR-271

_Date: 2026-06-27 · Auditor: Security Engineer · Scope: full product (client code, build tooling, CI, dependency metadata)_
_Recurring quality pass. Immediately prior: [CAR-251](./security-audit-CAR-251.md) (2026-06-27). Earlier: [CAR-233](./security-audit-CAR-233.md), [CAR-205](./security-audit-CAR-205.md), [CAR-189](./security-audit-CAR-189.md), [CAR-168](./security-audit-CAR-168.md), [CAR-149](./security-audit-CAR-149.md), [CAR-126](./security-audit-CAR-126.md), [CAR-91](./security-audit-CAR-91.md)._

## Headline

**No new actionable security findings.** Full `npm audit` reports **0 vulnerabilities**.
The only outdated packages are dev-tool patch/minor bumps (`@commitlint/*` and
`@playwright/test`), with no associated advisory in the current audit output. No new
fix-issues filed: the two concrete security follow-ups remain already tracked as
**CAR-48** (Vite/esbuild advisory upgrade, currently `in_review`) and **CAR-87** (CSP
defense-in-depth, `backlog`).

## Threat model (re-confirmed)

- Fully client-side, single-player static browser game. No backend, auth, accounts,
  cross-user state, runtime network calls, server redirects, or CORS surface.
- No PII or committed application secrets were found in source/config grep. Player state
  remains local to the user's browser through `localStorage`.
- The known DOM sink surface is unchanged from prior passes: `innerHTML` is used for
  internal game UI rendering, with no URL/free-text/file-import source feeding it.

## Checks run this pass

| Check | Result |
|---|---|
| `npm audit --json` | **0 vulnerabilities** (`critical:0 high:0 moderate:0 low:0`) |
| `npm outdated --json` | Dev tooling only: `@commitlint/cli` 20.5.0 → 20.5.3/21.1.0, `@commitlint/config-conventional` 20.5.0 → 20.5.3/21.1.0, `@playwright/test` 1.61.0 → 1.61.1 |
| Dangerous sinks grep: `eval`, `new Function`, `document.write`, `insertAdjacentHTML`, `outerHTML` | None present in app source/HTML |
| Network/exfil grep: `fetch`, `XMLHttpRequest`, `WebSocket`, `postMessage`, `sendBeacon`, `document.cookie` | None present in app source/HTML |
| Secret grep: `api[_-]?key`, `secret`, `password`, `bearer`, `sk-*` | No application secrets found in app source/config |
| User-controlled input grep: URL search/hash, referrer, `FileReader`, text inputs, `textarea`, `contenteditable`, `prompt` | None present in app source/HTML |
| External link hardening | CAR-251 fix still present: all 14 external `target="_blank"` links include `rel="noopener noreferrer"` |
| CI workflow review | `.github/workflows/deploy.yml` still uses `push` to `main` + `workflow_dispatch`, least-privilege Pages permissions, no `pull_request_target`, no secrets consumed |

## Findings

### F1 — No new vulnerable dependencies (Informational)

`npm audit --json` is clean across the current tree. Dependency hygiene is materially better
than the earlier Vite 5/esbuild state; **CAR-48** already tracks the Vite upgrade and is
currently `in_review`, so this pass does not re-file it.

### F2 — Dev-tool updates available, no security driver (Informational)

`npm outdated --json` reports only:

- `@commitlint/cli` 20.5.0 → wanted 20.5.3, latest 21.1.0
- `@commitlint/config-conventional` 20.5.0 → wanted 20.5.3, latest 21.1.0
- `@playwright/test` 1.61.0 → wanted/latest 1.61.1

These are development-only tools with no audit advisory. A routine maintenance pass can take
the patch updates later, but this security audit should not create churn or a duplicate
"dependency hygiene" issue without a concrete risk.

## Already tracked (not re-filed)

- **CAR-48** — `[security] Upgrade Vite 5 → latest to clear esbuild dev-server advisory`
  (`in_review`). Do not duplicate this item from recurring audits.
- **CAR-87** — `[security] Add a restrictive Content-Security-Policy to index.html / game.html`
  (`backlog`). Still low-severity defense-in-depth for a static, credential-free app; strict
  CSP requires real inline-script/style cleanup rather than a quick header/meta tweak.

## Disposition

**Done.** No new child fix-issues warranted. The current dependency audit is clean, newly
available version drift is dev-tool-only and non-advisory, source/CI scans did not reveal a
new exploitable surface, and concrete recurring security work is already tracked by CAR-48
and CAR-87.
