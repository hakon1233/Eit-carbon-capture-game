# CAR-254 — Browser QA pass (/qa-live)

Date: 2026-06-27
Agent: QA-live (independent of the implementer; report-don't-fix)
Suite: `tests/e2e/` (Playwright, headless Chromium), driven by `playwright.config.js`
(Vite dev server on :5179, base `/Eit-carbon-capture-game/`).

## Baseline

Canonical suite at start of pass: **23 passed** (game-flows ×16, map-error-fallback ×3,
modal-accessibility ×4). All green. The CAR-236 pass had pinned the endgame loss
transition + results modal.

## What this pass added

`tests/e2e/carbon-breakdown.spec.js` — new file, **3 tests** across two central in-game
surfaces that no existing spec exercised:

**Carbon-balance breakdown popup** (opened from the HUD `#net-co2-stat`, `role="button"`):
- `opens from the HUD net-CO2 stat and shows the regional breakdown` — asserts the popup
  opens, defaults to the **By Region** tab (`#carbon-tab-regions` active, `#carbon-regions-list`
  non-empty), and that the net balance / ppm-change readouts render with their units
  (`Gt CO2/year`, `ppm/year`).
- `switches to the Global Summary tab and lists emissions + removals` — clicks the
  **Global Summary** tab, asserts the active-tab toggle (`switchCarbonTab`) flips
  `#carbon-tab-global` active and `#carbon-tab-regions` inactive, and that the emissions
  list + totals + removals total all populate.

**Sidebar tab navigation:**
- `World/Region/Tech tabs switch the active panel` — asserts the three sidebar tabs
  (World/Region/Tech), World active on game start, and that switching to Tech activates
  the tech tab and reveals `#tech-panel`, and switching to Region activates the region tab.

Focus-trap / Escape / focus-restore for the carbon dialog is **not** re-added here — it is
already covered by `modal-accessibility.spec.js` ("carbon balance dialog traps focus...").
A redundant fourth test was written during exploration and removed to keep the suite lean.

Final suite: **26 passed** (~40s).

## What was driven (headless, real app)

Launch → New Game nav → setup → region select → start → HUD populated → advance month →
restart guard → tutorial replay → Climate build → Power Add/Replace dialog → endgame
loss transition + results modal → console/pageerror health → modal a11y ×4 → map
error/fallback ×3 → **NEW: carbon-balance breakdown popup (open, By Region rows, Global
Summary tab switch, emissions/removals lists) → sidebar World/Region/Tech tab switching**.
Evidence: `playwright-report/` (HTML report); traces/video retained on failure only.

## Triage — no new issues filed

- **No new genuine bugs found.** Both newly-covered surfaces behave correctly; zero
  console errors / pageerrors observed while driving them.
- **"Advance 1 Year" stops partway when an event popup appears** — investigated and
  confirmed **by design**, not a bug: `advanceOneYear()` (game.js:11002) loops up to 12
  months but breaks on `isPlayerPromptOpen()` so the player can act on the event. The
  separate UX concern (no intermediate/summary feedback over the 12 ticks) is **already
  tracked as CAR-200** (open, backlog) — not re-filed.
- **Tech tree requires Research Centers** to generate RP before any tech is unlockable —
  expected gating (`renderTechTreePanel` shows a build-a-research-center tip), not a bug.
- **Vite dev-server `/public/modules/...` notices** — cosmetic dev-only noise (static ES
  imports Rollup bundles at build time). Not a bug (carried from prior passes).

## Coverage still open for a future pass (NOT bugs)

- **Win transition** — still uncovered (loss path pinned in CAR-236); needs a sim-aware
  deterministic setup to avoid flake.
- **Alliance negotiation** flow for a non-home region before building there (still uncovered).
- **Research center build → RP accrual → tech unlock** — the full research economy loop
  (build a Research Center, accrue RP over months, unlock a technology) is untested; worth
  a dedicated multi-month, bridge-driven setup in a later pass.
- **Carbon-tax / negotiation slider** flows (sliders flagged for a11y in CAR-137/CAR-197).
