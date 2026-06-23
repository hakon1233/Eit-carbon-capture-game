---
name: tech-debt-review-CAR-97
description: Recurring architecture & tech-debt review (CAR-97). What changed this pass, what is already tracked, what was verified clean as of 2026-06-23.
type: reference
last_reviewed: 2026-06-23
---

# Architecture & tech-debt review — CAR-97 (2026-06-23)

Recurring Quality-Loop architecture pass. Goal: catch tangled modules, leaky
abstractions, duplicated logic, risky patterns, and missing error handling — make the
small clearly-safe fixes directly, file small reversible issues for the rest, and **not**
re-file what an open issue already tracks.

Builds on **CAR-82** (2026-06-22) and **CAR-61**. Their findings still stand and remain the
correct priorities. **No new structural problem was found** this pass. The codebase shape is
stable (`game.js` 15.7k lines / 326 top-level functions; `style.css` 124 KB; only
`public/modules/data/` is wired in). Persistence remains robust.

## Change landed this pass

- **Gated verbose `[Map]` debug logging behind `window.DEBUG_MAP`** (commit `68f30b7`).
  The 9 `console.log('[Map]' …)` traces (game load, setup, `selectRegion`, `handleSvgClick`)
  fired on every interaction and were pure noise in the production console. They now route
  through a small `mapDebug()` helper that is off by default and can be flipped on in DevTools
  via `window.DEBUG_MAP = true` with no rebuild. The 6 genuine `console.warn('[Map]' …)`
  calls (unexpected-state warnings) are left untouched. Behavior-neutral; `npm run build` ✓
  and the affected e2e tests pass. This resolves the "minor / not worth an issue" item the
  CAR-82 pass deliberately deferred (it was waiting on the in-flight CAR-80 perf pass, now
  recorded).

## Prioritized findings — already tracked, do NOT re-file

The actionable architecture debt is fully captured by open backlog issues. Priority order:

1. **P1 — `game.js` 15.7k-line monolith → `CAR-69`.** 326 functions on one flat namespace;
   every edit drags the whole file into context. Plan is correct: ONE small behavior-preserving
   leaf extraction, not a rewrite. Highest-leverage next move. Not started.
2. **P1 — orphaned `public/modules/{config,systems,ui,utils}` + `styles/` trees → `CAR-67`.**
   Dead parallel copies; double-maintenance tax + silent-drift risk. Decision pending
   (delete recommended). Interim README mitigation already shipped.
3. **P2 — no error boundary around `nextMonth()` core tick → `CAR-68`.** Re-verified still
   open this pass: `nextMonth()` (`game.js:~10561`) increments `state.month`/`state.year`
   **first**, then mutates `state` across ~20 subsystems with no try/catch. Any subsystem
   throw leaves a half-applied turn and a frozen game with no user feedback. Small,
   well-specified fix. **Considered landing it here but left it filed** — wrapping ~300 lines
   of multi-subsystem mutation on the hottest shared file (under concurrent edit by other
   quality-loop agents) is not a "clearly-safe trivial" change; it deserves its own focused
   issue with the rollback reasoning CAR-68 already specifies. Recommend prioritizing after
   CAR-69.
4. **P3 — dead CSS / bundle split → `CAR-66`.** In the perf lane; not duplicated here.

## Verified clean this pass (no action)

- **Persistence robust.** Both `JSON.parse` sites are try/catch guarded: `loadGame()`
  (`game.js:~6557`) validates `saveData.state` and returns `false` on malformed input;
  `getCollapsedSections()` (`~13001`) try/catches and returns `{}`. No unguarded persistence
  reads remain.
- **No `TODO`/`FIXME`/`HACK`/`XXX` markers** in `game.js`.
- **No duplicate top-level function/const names** — the CAR-36 collision class stays fixed.

## Operational note

`game.js` is edited concurrently by multiple quality-loop agents in the shared workspace
(observed live this pass: the untracked `tests/e2e/region-actions.spec.js` and `game.js` both
shifted mid-run). Always `git pull --rebase` immediately before committing here, and keep each
change to a single file with a minimal diff so rebases stay clean.

## Disposition

One small, clearly-safe observability improvement landed (build + e2e green). The actionable
architecture debt is fully captured by **CAR-66 / 67 / 68 / 69**; the highest-leverage next
move is starting **CAR-69**'s first leaf extraction. No duplicate issues were filed.
