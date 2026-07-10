# CAR-398 — Browser QA pass (/qa-live)

Date: 2026-07-10
Agent: QA-live (independent of the implementer; report-don't-fix)
Suite: `tests/e2e/` (Playwright, headless Chromium), driven by `playwright.config.js`
(Vite dev server on :5179, base `/Eit-carbon-capture-game/`).

## Housekeeping — rescued stranded QA coverage

Before running a new pass, found the local `qa-car222` branch held 2 commits never
pushed to `origin/main` (test(qa) CAR-236 endgame results modal + CAR-254 carbon-balance
breakdown/sidebar-tabs coverage, ~2 weeks old). Rebased cleanly onto current main
(one trivial append-only conflict in `docs/sessions/2026-06-26.md`, resolved by keeping
both sides), verified build + full suite green, and pushed directly — this content would
otherwise have been silently lost. `origin/main` moved twice more from concurrent Quality
Pass sibling agents while doing this; re-rebased each time before the push landed clean.

Two other stale local branches were found but **not** rescued: `qa-local-backup`
(61 commits behind, `game.js` diverged by 500+ lines — its CAR-152/171/192/208 test
coverage areas are already superseded by newer equivalent tests added later, e.g.
CAR-217's power-dialog tests) and `qa/car-129-browser-pass` (64 behind; adds
`progression-persistence.spec.js` + `region-actions.spec.js`, covering Advance-1-Year
contract + save/Continue round-trip + region actions — genuinely not superseded, but too
stale to safely rebase given the drift). Left in place for a future pass to re-author
fresh against current main rather than risk a bad mechanical merge.

## Baseline

Suite after the rescue, before this pass's new work: **32 passed**. Confirmed via
`npm run build` + `npx playwright test`.

## What this pass added

`tests/e2e/game-flows.spec.js` — new describe block **`Advance 1 Year`** (1 test).
The "Advance 1 Year" button (`advanceOneYear()`, game.js) had zero coverage — every
prior pass either skipped it or (CAR-254) explicitly flagged it as a gap for later.
Its contract is a synchronous loop of up to 12 `nextMonth()` calls that breaks early on
`state.gameOver` or `isPlayerPromptOpen()` (an event/negotiation/build-mode popup).
Random events make the exact month count non-deterministic run to run, so the test
asserts the **contract** instead of a fixed count:

- One click advances the in-game clock by 1-12 months (never more, never zero).
- Any popup left open by an early-exit gets dismissed and the game returns to a normal
  playable state (`#next-month` / `#advance-year` both re-enabled), unless the run
  happened to end.

Ran 5x standalone before folding into the suite to check for flake — stable every time,
no bug surfaced (the loop behaves exactly per its documented break conditions).

Final suite: **33 passed** (~44s).

## What was driven (headless, real app)

Launch → New Game nav → setup → region select → start → HUD populated → advance month →
restart guard (accept + cancel) → **NEW: Advance 1 Year (single click, contract-level
assertion)** → endgame-banner-hidden-during-play → tutorial replay → Climate build
(start + completion, real button path) → Power Add/Replace dialog → endgame loss
transition + results modal → console/pageerror health → carbon-balance breakdown popup +
sidebar tab switching → modal a11y ×6 → map error/fallback ×3.
Evidence: `playwright-report/` (HTML report); traces/video retained on failure only —
none failed.

Also spot-checked the most recent main commit (CAR-401, dropped dead `rules.html` /
`systems.html` Vite entries) for a dead-link regression: rebuilt + reran the full suite
after it landed, still 33/33 green — no regression.

## Triage — no new issues filed

- **No new genuine bugs found.** The one newly-covered surface (Advance 1 Year) behaves
  exactly per its documented contract; zero console errors/pageerrors observed driving it.
- Confirms CAR-254's prior finding: Advance 1 Year stopping early on an event popup is
  **by design**, not a bug. The separate "no intermediate feedback over the 12 ticks" UX
  concern is already tracked as open **CAR-200** — not re-filed.

## Coverage still open for a future pass (NOT bugs, not re-filed)

Carried forward from CAR-254, still true:
- **Win transition** — only the loss path is pinned (CAR-236); needs a sim-aware
  deterministic setup to avoid flake.
- **Alliance negotiation** flow for a non-home region before building there.
- **Research center build → RP accrual → tech unlock** economy loop.
- **Carbon-tax / negotiation slider** flows (sliders separately flagged for a11y in
  CAR-137/CAR-197).

New from this pass:
- `qa/car-129-browser-pass`'s `progression-persistence.spec.js` (save/Continue
  round-trip across reload) and `region-actions.spec.js` content is real, un-superseded
  coverage stranded on a 64-commits-stale branch — worth re-authoring fresh rather than
  mechanically rescuing, given how far `game.js` has drifted.
