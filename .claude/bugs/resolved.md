# Resolved Bugs

Archive of fixed and verified bugs. The fix loop checks these for regressions on every run.

## BUG-001: Restart e2e cancelled its own confirmation

**Resolved:** 2026-06-26
**Workflow:** Gameplay
**Fix:** `tests/e2e/game-flows.spec.js` accepts and asserts the restart confirmation before checking setup mode.
**Regression guard:** `npm run test:e2e -- --reporter=line`

## BUG-002: CO2 formatter regression script referenced removed module mirror

**Resolved:** 2026-06-26
**Workflow:** Gameplay
**Fix:** `scripts/test-co2-reduction-formatting.mjs` now targets the live `game.js` formatter instead of the removed `public/modules/config/projects.js` mirror.
**Regression guard:** `node scripts/test-co2-reduction-formatting.mjs`
