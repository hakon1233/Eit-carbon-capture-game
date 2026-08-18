# Security & Dependency Hygiene Audit - CAR-395

_Date: 2026-07-10. Auditor: Security Engineer. Scope: full product: static client app, build tooling, dependency metadata, and security-relevant source/config._
_Recurring quality pass. Immediately prior: [CAR-271](./security-audit-CAR-271.md) (2026-06-27). Earlier: [CAR-251](./security-audit-CAR-251.md), [CAR-233](./security-audit-CAR-233.md), [CAR-205](./security-audit-CAR-205.md), [CAR-189](./security-audit-CAR-189.md), [CAR-168](./security-audit-CAR-168.md), [CAR-149](./security-audit-CAR-149.md), [CAR-126](./security-audit-CAR-126.md), [CAR-91](./security-audit-CAR-91.md)._

## Headline

No new actionable security findings. `npm audit --json` reports 0 known
vulnerabilities across the current install. The remaining dependency drift is
development tooling only: patch updates for Vite and Playwright, patch/major
availability for commitlint. No new fix-issues were opened because the only
durable security follow-ups are already tracked as CAR-48 and CAR-87.

## Threat model re-confirmed

- Fully client-side, single-player static browser game. No backend, auth,
  accounts, server-side redirects, SSRF target, CORS policy surface, or runtime
  network call channel in the app source/HTML reviewed.
- Player state remains local to the browser through `localStorage`; tampering is
  self-directed game-state manipulation rather than a cross-user attack path.
- The DOM sink profile is unchanged from prior passes: `innerHTML` is used for
  internal game UI rendering. No URL/search/hash/free-text/file-import source was
  found feeding these sinks during this pass.
- External reference links still include `rel="noopener noreferrer"` from the
  CAR-251 fix.

## Checks run

| Check | Result |
|---|---|
| `npm audit --json` | 0 vulnerabilities (`critical:0 high:0 moderate:0 low:0`) |
| `npm outdated --json` | Dev tooling only: `vite` 8.1.0 to 8.1.4, `@playwright/test` 1.61.0 to 1.61.1, `@commitlint/*` 20.5.0 to 20.5.3 wanted / 21.x latest |
| Dangerous sink grep: `eval`, `new Function`, `document.write`, `insertAdjacentHTML`, `outerHTML` | No app-source findings beyond expected `innerHTML` UI rendering sites |
| Network/exfil grep: `fetch`, `XMLHttpRequest`, `WebSocket`, `postMessage`, cookies | No app-source network or cookie surface found |
| Secrets sweep: `.env*`, `*.pem`, `*.key`, secret/credential filenames; source token/password/API-key grep | No committed application secrets found |
| Duplicate dependency tree spot-check: `npm ls --all --json` | Small dev-tool-only tree; no security-relevant duplicate-package finding |
| Already-tracked issue check | CAR-48 remains `in_review`; CAR-87 remains `backlog` |

## Findings

### F1 - No known vulnerable dependencies (Informational)

`npm audit --json` is clean for the current tree. The previously recurring
Vite/esbuild development-server advisory is already represented by CAR-48 and
the working branch is already on Vite 8. No duplicate dependency vulnerability
issue is warranted from this pass.

### F2 - Dev-tool version drift without a security driver (Informational)

Outdated packages are all development tools. The low-risk patch updates can be
taken by routine dependency maintenance, but there is no advisory-backed reason
to open a security fix issue in this audit:

- `vite` 8.1.0 to 8.1.4
- `@playwright/test` 1.61.0 to 1.61.1
- `@commitlint/cli` and `@commitlint/config-conventional` 20.5.0 to 20.5.3
  wanted, with 21.x majors available

## Already tracked, not re-filed

- CAR-48 - `[security] Upgrade Vite 5 -> latest to clear esbuild dev-server advisory`
  is still `in_review`. This pass confirmed `npm audit` is clean and did not
  create a duplicate.
- CAR-87 - `[security] Add a restrictive Content-Security-Policy to index.html / game.html`
  is still `backlog`. It remains low-severity defense-in-depth for a static,
  credential-free app and needs real inline-script/style cleanup rather than a
  quick meta-tag change.

## Disposition

Done. No new child fix-issues warranted. Dependency audit is clean, no committed
secrets were found, no app runtime network/auth/server surface was found, and
the only security work that still genuinely moves the needle is already tracked.
