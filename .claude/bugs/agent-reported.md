# Agent-Reported Bugs

Bugs discovered by automated testing agents. Each entry is also tracked in the matching `workflows/*.md` file.

<!-- Next ID: BUG-005 -->

## BUG-001: Restart e2e cancelled its own confirmation

**Status:** Resolved
**Classification:** MATRIX_BUG
**Reporter:** Agent
**Workflow:** Gameplay
**Reproducer:** `npm run test:e2e -- --reporter=line`
**Symptom:** The restart e2e expected setup mode after clicking Restart, but Playwright auto-dismissed the active-run confirmation and cancelled the restart.

## BUG-002: CO2 formatter regression script referenced removed module mirror

**Status:** Resolved
**Classification:** MATRIX_BUG
**Reporter:** Agent
**Workflow:** Gameplay
**Reproducer:** `node scripts/test-co2-reduction-formatting.mjs`
**Symptom:** The regression script failed with `ENOENT` for `public/modules/config/projects.js`, a removed mirror path.

## BUG-003: Construction field mismatch bypassed caps and inflated embodied carbon

**Status:** Resolved
**Classification:** CONFIRMED
**Reporter:** Agent
**Workflow:** Gameplay
**Reproducer:** `node scripts/test-construction-field-consistency.mjs`
**Symptom:** Queued construction records were ignored by regional project caps, and embodied-carbon emissions increased as `monthsRemaining` fell.

## BUG-004: Endgame regression harness broke when showEndgameResultsModal gained a clearEventPopups() call

**Status:** Resolved
**Classification:** MATRIX_BUG
**Reporter:** Agent
**Workflow:** Gameplay
**Reproducer:** `node scripts/test-endgame-results-modal.mjs`
**Symptom:** The endgame-modal regression script threw `ReferenceError: clearEventPopups is not defined`; nothing in CI/husky runs the `scripts/test-*.mjs` guards, so the break went unnoticed after commit `9b78587`.
