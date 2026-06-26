# CAR-236 — Browser QA pass (/qa-live)

Date: 2026-06-26
Agent: QA-live (independent of the implementer; report-don't-fix)
Suite: `tests/e2e/` (Playwright, headless Chromium), driven by `playwright.config.js`
(Vite dev server on :5179, base `/Eit-carbon-capture-game/`).

## Baseline

Canonical suite at start of pass: **22 passed** (game-flows ×15, map-error-fallback ×3,
modal-accessibility ×4). All green. The CAR-222 pass had already re-added the Climate
build + restart-cancel coverage and verified the CAR-217 power Add/Replace dialog.

## What this pass added

`tests/e2e/game-flows.spec.js` — new describe block **`Endgame results modal (CAR-236)`**
(1 test). Prior passes pinned only the *banner-stays-hidden-during-a-live-run* invariant
(CAR-198); the actual **game-over transition** had no coverage at all. The new test drives
the deterministic time-out loss and asserts the whole transition end to end:

- Set `state.year = 2101` via `window.__carbonTestBridge` (checkWinLose loses when
  `state.year > GAME_CONFIG.loseYear` = 2100, **independent of the climate sim**, so the
  test is robust against the monthly temperature recompute — no flake).
- Advance one month → `updateEndgameStreaks()` → `checkWinLose()` flips `state.gameOver`.
- Assert the results modal (`#endgame-results-popup`) shows with **defeat** styling:
  title "Run Failed", outcome "Climate Catastrophe", `.endgame-results-dialog.defeat`.
- Assert `#next-month` is **disabled** (updateControls on game-over).
- Assert the re-entry banner is **hidden while the modal is open**, then **revealed once
  the modal is dismissed** (`syncEndgameBanner`) — the CAR-198 affordance that stops a
  player being stranded on a frozen board.
- Assert **Play Again** from the banner (`#endgame-banner-play-again` → `initGame()`)
  clears game-over and returns to setup mode.

Final suite: **23 passed** (~43s).

## What was driven (headless, real app)

Launch → New Game nav → setup → region select → start → HUD populated → advance month →
restart guard (accept + cancel) → endgame-banner-hidden-during-play → tutorial replay →
Climate build (start + completion, real button path) → Power Add/Replace dialog +
Replace-Fossil retirement → **NEW: game-over transition (loss) → results modal → controls
disabled → banner reveal-on-dismiss → Play Again → back to setup** → console/pageerror
health → modal a11y ×4 → map error/fallback ×3.
Evidence: `playwright-report/` (HTML report); traces/video retained on failure only.

## Triage — no new issues filed

- **No new genuine bugs found.** The endgame transition behaves correctly end to end.
- **Replace-Fossil balance concern** (retire amount decoupled from clean GW added, no
  supply penalty) is **already tracked as CAR-231** (open, backlog) — not re-filed.
- **Vite dev-server `/public/modules/...` notices** — cosmetic dev-only noise from static
  ES imports Rollup bundles at build time. Not a bug (carried from prior passes).
- **Event-popup interception on month-advance** — expected game behavior; the
  `advanceMonth`/`dismissEventPopupIfPresent` helpers dismiss popups the way a player would.

## Coverage still open for a future pass (NOT bugs)

- **Win transition.** The loss path is now pinned; the *victory* path
  (`winStreakMonths >= 12`) shares the same modal/banner machinery (only title/outcome/
  class differ) but is harder to force deterministically — it requires holding
  `temperature <= winTemp` **after** the monthly recompute for the streak to accrue, which
  the climate sim does not make trivial to pin without flake. Worth a dedicated, sim-aware
  setup in a later pass.
- **Alliance negotiation** flow for a non-home region before building there (still uncovered).
- **Replace-Fossil balance fix verification** — once CAR-231 is addressed, add a test
  asserting the retire amount is capped to clean GW added.
