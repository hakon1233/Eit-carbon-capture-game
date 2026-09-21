---
name: product-gap-grooming-CAR-114
description: PM product-gap and backlog grooming pass for CAR-114, resumed after adapter recovery and deduped against later PM passes.
type: reference
last_reviewed: 2026-06-26
---

# Product Gap & Backlog Grooming Pass - CAR-114

PM quality-loop pass resumed after the original CAR-114 run was stranded by an
adapter authentication/runtime failure. Scope was report-only: review the
carbon-capture climate strategy game's core user journeys, dedupe against the
current backlog, and open only small, reversible follow-up issues for concrete
product gaps not already tracked.

## Method

- Used the running Paperclip API for current issue context because the CAR-114
  workspace checkout was empty. The project registry points to the live repo at
  the local checkout.
- Reviewed the parent quality pass and active backlog, including all open
  product/UX issues.
- Re-read the latest PM product passes:
  - `docs/product-gap-grooming-CAR-173.md`
  - `docs/product-gap-grooming-CAR-194.md`
  - `docs/product-gap-grooming-CAR-224.md`
  - `docs/product-gap-grooming-CAR-238.md`
- Sampled the current code/docs for core user journeys:
  launch and difficulty selection, Continue/New Game, setup, play HUD, map data
  views, region actions, research centers, achievements, win/loss, endgame
  results, restart, and help/tutorial access.
- Checked `docs/TODO.md` and `docs/NICE-TO-HAVE.md` so deferred stretch ideas
  were not refiled as near-term product gaps.

## Findings

No new backlog issue was opened from this resumed pass.

The backlog is already heavily groomed and the concrete product gaps found in
this review are represented by active or recently filed tickets:

| Area | Existing coverage |
| --- | --- |
| First-run tutorial/help access | CAR-104, CAR-202, CAR-229 |
| Autosave, save/load clarity, import/export | CAR-186, CAR-227, CAR-144, CAR-165, CAR-164 |
| Achievements persistence/progress/endgame summary | CAR-228, CAR-142, CAR-214 |
| Event/news history and empty states | CAR-213, CAR-139, CAR-105 |
| Win/loss and difficulty surfacing | CAR-199, CAR-200, CAR-201, CAR-102, CAR-163 |
| Research-center wrong-pointer copy | CAR-243 |
| Exit/restart/endgame affordances | CAR-187, CAR-198 |
| Educational glossary and lower-priority stretch ideas | CAR-143 plus `docs/NICE-TO-HAVE.md` |

## Backlog Hygiene Notes

- CAR-238 already filed CAR-243 for the only genuinely new product gap found in
  the latest pass: the Research Centers empty state points to a non-existent
  "Diplomacy tab".
- CAR-198 is already done and the current code includes the endgame re-entry
  banner with View Results / Play Again controls.
- CAR-199 appears partly addressed in current player-facing copy: `index.html`
  and `game.html` now mention the 12-month hold requirement. I did not close it
  here because the ticket owner should verify every listed surface and the
  consecutive-loss wording before resolving it.
- CAR-201 remains valid: current HUD exposes win progress, but I found no
  persistent difficulty chip during play.
- Broad Phase 2-5 ideas in `docs/TODO.md` and `docs/NICE-TO-HAVE.md` are
  intentionally deferred roadmap scope, not small quality-loop tickets.

## Disposition

CAR-114 was older than several later completed product passes. After checking
the current backlog and source, creating another issue would duplicate existing
work rather than improve the product queue. The useful output from this resumed
pass is the deduped disposition above: no new tickets, no implementation, and no
status changes to other backlog items.
