# Gameplay Bugs

## BUG-001: Restart e2e cancelled its own confirmation

**Status:** Resolved
**Classification:** MATRIX_BUG
**Reporter:** Agent
**Reproducer:** `npm run test:e2e -- --reporter=line`
**Symptom:** The `restart returns to setup mode` e2e failed because `#setup-panel` stayed hidden after clicking Restart.
**Root cause:** The app intentionally prompts before discarding an active run. Playwright auto-dismisses unhandled dialogs, so the test clicked Restart and implicitly cancelled the action.
**Fix:** `tests/e2e/game-flows.spec.js` now accepts the restart confirmation and asserts the prompt text before checking setup mode.
**Regression guards:** The same e2e covers restart behavior through the real browser confirmation path.

## BUG-002: CO2 formatter regression script referenced removed module mirror

**Status:** Resolved
**Classification:** MATRIX_BUG
**Reporter:** Agent
**Reproducer:** `node scripts/test-co2-reduction-formatting.mjs`
**Symptom:** The script failed with `ENOENT` for `public/modules/config/projects.js`.
**Root cause:** The old modular project config mirror was removed; current modular project data lives under `public/modules/data/project-data.js` and does not contain the display formatter.
**Fix:** `scripts/test-co2-reduction-formatting.mjs` now tests the live `game.js` formatter that project cards actually use.
**Regression guards:** The script still verifies signed-zero normalization and direct formatting guards in `game.js`.

## BUG-003: Construction field mismatch bypassed caps and inflated embodied carbon

**Status:** Resolved
**Classification:** CONFIRMED
**Reporter:** Agent
**Reproducer:** `node scripts/test-construction-field-consistency.mjs`
**Symptom:** Queued construction records were ignored by regional project caps, and embodied-carbon emissions doubled halfway through a build instead of staying spread across the original construction duration.
**Root cause:** `startConstruction()` persists records with `type` and `monthsTotal`, but two readers used stale names: the regional cap check read `projectType`, and `calculateEmbodiedCarbon()` read `totalMonths` before falling back to `monthsRemaining`.
**Fix:** `game.js` now counts queued builds by `c.type` and spreads embodied carbon across `construction.monthsTotal`, with a `totalMonths` fallback for older save shapes.
**Regression guards:** `scripts/test-construction-field-consistency.mjs` exercises the embodied-carbon calculation and statically guards the regional-cap field name.

## BUG-004: Endgame regression harness broke when showEndgameResultsModal gained a clearEventPopups() call

**Status:** Resolved
**Classification:** MATRIX_BUG
**Reporter:** Agent (CAR-204 Engineer bug-hunt pass)
**Reproducer:** `node scripts/test-endgame-results-modal.mjs`
**Symptom:** The script threw `ReferenceError: clearEventPopups is not defined` at `showEndgameResultsModal`, so the endgame-modal regression guard could not run at all.
**Root cause:** Commit `9b78587` added a `clearEventPopups()` call inside `showEndgameResultsModal()` (to clear stale event popups that could block the post-run Play Again banner). The node harness extracts that function into a `vm` sandbox and stubs each of its dependencies on the `context` object, but no stub was added for the new `clearEventPopups` dependency. The Playwright e2e suite passed because `clearEventPopups` is a real function in the browser; the node harness is a separate path that nothing in CI or husky runs, so the break was invisible.
**Fix:** `scripts/test-endgame-results-modal.mjs` now stubs `clearEventPopups` (a counted no-op, mirroring the existing `clearSavedGame`/`syncEndgameBanner` stubs) and asserts the endgame modal clears queued popups when it opens — turning the crash into a positive regression guard for the popup-clearing behavior. Mutation-checked: removing the `clearEventPopups()` call from `game.js` makes the assertion fail (exit 1).
**Regression guards:** `node scripts/test-endgame-results-modal.mjs`; also now runnable in one command via the new `npm run test:regression` (added `package.json` script that runs every `scripts/test-*.mjs`).
