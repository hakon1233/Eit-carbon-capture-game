# CAR-222 — Browser QA pass (/qa-live)

Date: 2026-06-26
Agent: QA-live (independent of the implementer; report-don't-fix)
Suite: `tests/e2e/` (Playwright, headless Chromium), driven by `playwright.config.js`
(Vite dev server on :5179, base `/Eit-carbon-capture-game/`).

## Workspace sync note (important)

This QA workspace's local `main` had **diverged** from `origin/main`: it carried 5
prior-QA commits (CAR-74/152/171/192/208 tests + docs) that were committed locally
but **never pushed**, while `origin/main` had advanced 30 commits — including the
**CAR-217 fix** (power build-mode dialog) and that fix's own Add/Replace tests.

Consequence already visible upstream: the CAR-217 implementer noted "the tripwire
test the issue referenced was never actually committed to the repo" — correct,
because it lived only on this stranded local branch.

Action taken this pass: backed up the stranded commits to branch `qa-local-backup`,
then based QA work on canonical `origin/main` (branch `qa-car222`) so we test the
**real current app**. The unique coverage that existed only on the stranded branch
(Climate build/completion, restart cancel-branch) was **re-added** to the canonical
suite so it is no longer at risk of loss. The obsolete CAR-208 "dialog unreachable"
tripwire was intentionally **not** re-added — CAR-217 made the dialog reachable, so
the engineer's real Add/Replace tests supersede it.

## Baseline

Canonical `origin/main` suite at start of pass: **19 passed** (game-flows ×12,
map-error-fallback ×3, modal-accessibility ×4). CAR-217's Add/Replace tests included.

## What this pass added

Re-added the stranded, still-valuable coverage onto canonical `origin/main`
(`tests/e2e/game-flows.spec.js`):

1. **`Build-a-project mechanic (Climate)`** (2 tests) — drives the REAL project-button
   click path (not the test bridge): open Climate tab → click an affordable project →
   assert `#under-construction` +1, `#credits` changed, "Construction started" in the
   news log; then a Reforestation build advanced to completion → `#projects-display`
   +1, `#under-construction` back to baseline, "completed" in the news log. Origin had
   **no** Climate-build coverage at all.
2. **`Core gameplay loop › cancelling the restart confirmation keeps the game running`** —
   origin covered only the *accept* branch of the CAR-74 restart guard; this pins the
   *cancel* branch (dismiss → live game untouched), which is the guard's whole point.

Final suite: **22 passed** (~28s).

## CAR-217 fix — verified working (and the engineer's QA ask answered)

CAR-217 (power build-mode dialog) is marked done. Verified end-to-end against the
real app:
- The Add/Replace dialog now opens on a power build (was unreachable dead code before).
- "Replace Fossil" sets `region.retiredFossilGW` and **does** reduce emissions:
  retiring Europe's full 100.5 GW coal dropped its region emissions from 2.783 →
  2.395 Gt CO2/yr (~14%) over the build + recompute. (A single-month probe shows no
  change because `updateRegionalEmissions` recomputes *before* construction completion
  in the same tick; the effect lands the following month — not a bug, just timing.)

### Balance concern surfaced → filed as child fix-issue (report-don't-fix)

The engineer explicitly asked QA-live to sanity-check that re-enabling Replace Fossil
doesn't make the game trivially easy. It currently can:

- **Retirement is decoupled from the clean capacity you add.** The dialog's *default*
  retire amount is tied to the new project's clean output (balanced), but the
  `#replace-amount` input's `max` is the region's **entire** available fossil, and
  `confirmBuildModeDialog` only clamps to available fossil — not to the clean GW added.
- **No power-supply counterweight.** Retiring 100 GW of coal left `region.power.supply`
  unchanged (382.5 → 382.5) and raised no blackout risk — the emissions model reads
  `currentMixTWh − retiredFossilGW` but the power-supply model does not, so over-retiring
  has no in-game cost.
- **Net effect:** one $25B / 0.5 GW solar build (≈ the opening balance) can authorize
  retiring an entire region's fossil fleet — 200× the clean capacity actually built —
  cutting a large slice of emissions for minimal cost and no supply penalty.

Filed as a child issue with repro + proposed fix direction (cap replace amount to the
clean GW added, and/or apply a supply/stability penalty when retired fossil exceeds
added clean capacity). Not fixed here (report-don't-fix; balance retune is the
implementer's call).

## Triage notes (no issue filed)

- **Vite dev-server `/public/modules/...` notices** — cosmetic dev-only noise from
  static ES imports that Rollup bundles at build time. Not a bug (carried from prior passes).
- **Event-popup interception on month-advance** — expected game behavior; the
  `advanceMonth` helper dismisses popups the way a player would.
- **Single-month "no emissions change" after Replace** — timing of recompute vs
  completion, not a defect (see above).

## What was driven (headless, real app)

Launch → New Game nav → setup → region select → start → HUD populated → advance month →
restart guard (accept + cancel) → endgame-banner-hidden → tutorial replay → **Climate
build (start + completion, real button path)** → **Power Add/Replace dialog + Replace-
Fossil retirement** → console/pageerror health → modal a11y ×4 → map error/fallback ×3.
Evidence: `playwright-report/` (HTML report); traces/video retained on failure only.

## Coverage still open for a future pass (NOT bugs)

- **Alliance negotiation** flow for a non-home region before building there (still uncovered).
- **Win/lose endgame** transitions (sustained-temperature endgame; currently only the
  banner-stays-hidden invariant is pinned).
- **Replace-Fossil balance fix verification** — once the child balance issue is addressed,
  add a test asserting the retire amount is capped to clean GW added.
