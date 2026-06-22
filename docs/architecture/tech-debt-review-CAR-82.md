---
name: tech-debt-review-CAR-82
description: Recurring architecture & tech-debt review (CAR-82). Snapshot of structural debt, what is already tracked, and what was verified clean as of 2026-06-22.
type: reference
last_reviewed: 2026-06-22
---

# Architecture & tech-debt review — CAR-82 (2026-06-22)

Recurring Quality-Loop architecture pass. Goal: catch tangled modules, leaky
abstractions, duplicated logic, risky patterns, and missing error handling — make the
small clearly-safe fixes directly, file small reversible issues for the rest, and **not**
re-file what an open issue already tracks.

This pass builds on the earlier **CAR-61** architecture review, whose findings are still
open and remain the correct priorities. No large *new* structural problem was found; the
save/load and persistence paths verified clean.

## Codebase shape (measured)

| Surface | Size | Note |
| --- | --- | --- |
| `game.js` | 15,743 lines / 568 KB, one ES module | 325 top-level functions on one flat global namespace |
| `style.css` | 8,971 lines / 167 KB | single stylesheet |
| Module imports into `game.js` | only `./public/modules/data/index.js` | the `config/ systems/ ui/ utils/` trees are orphaned |
| `try/catch` blocks in `game.js` | 14 | save/load + localStorage guarded; the `nextMonth()` tick is **not** |
| `innerHTML =` sites | 65 | relevant to any CSS/markup pruning |

## Prioritized findings

### Already tracked — do NOT re-file (top priorities stand)

1. **P1 — `game.js` is a 15.7k-line monolith → `CAR-69` (backlog).** 325 functions on one
   namespace; every edit drags the whole file into context and name collisions are real
   (cf. shipped CAR-36 "Research Center" collision). Plan is correct: ONE small
   behavior-preserving leaf extraction, not a rewrite. **Not started — recommend
   prioritizing**, since it is the single biggest drag on maintainability and on every
   other agent that has to load this file.
2. **P1 — orphaned `public/modules/{config,systems,ui,utils}` + `styles/` trees → `CAR-67`
   (backlog).** Dead parallel copies of shipped logic; past fixes edited `game.js` and the
   orphan in lockstep (double-maintenance tax + silent-drift risk). Decision pending:
   delete vs. wire in. Interim README mitigation already shipped (`8df1858`).
3. **P2 — no error boundary around `nextMonth()` core tick → `CAR-68` (backlog).** The
   monthly loop mutates `state` across ~10 subsystems with no try/catch and increments
   `month`/`year` *first*; any subsystem throw leaves a half-applied turn and a frozen game
   with no user feedback. Small, well-specified fix (wrap body, `console.error` +
   `pushMessage(..., "bad")`).
4. **P3 — dead CSS / bundle split → `CAR-66` (backlog).** Cross-checked against the
   in-flight **CAR-80** performance pass; left in its lane, not duplicated here.

### Verified clean this pass (no action — recorded so the loop stops re-checking)

- **Save/load is robust.** `saveGame()`/`loadGame()` (`game.js:6520-6606`) wrap
  `JSON.parse` in try/catch, validate `saveData.state`, carry a `version` field, and run
  forward migrations (underConstruction, retiredFossilGW, sectorEmissions). Malformed save
  returns `false` rather than throwing.
- **Other localStorage reads are guarded.** `getCollapsedSections()` (`12982`) try/catches
  its parse; `loadDifficulty()` (`15279`) validates against `DIFFICULTY_MODES` with no
  parse. No unguarded persistence reads remain.
- **No duplicate top-level function/const names** — the CAR-36 collision class stays fixed.

### Minor / not worth an issue

- 9 production `[Map]` debug `console.log` calls remain in hot paths (region click, month
  tick, game load). Low value, scattered, and `game.js` is a shared file currently touched
  by the in-flight CAR-80 pass — deliberately *not* edited here to avoid merge churn. If a
  future pass introduces a debug flag, gate these behind it.

## Disposition

No code changed in this pass (the build stays green — `npm run build` ✓). The actionable
architecture debt is fully captured by **CAR-67 / CAR-68 / CAR-69** and the perf-adjacent
**CAR-66**; the highest-leverage next move is starting **CAR-69**'s first leaf extraction.
This doc is the findings deliverable; no duplicate issues were filed.
