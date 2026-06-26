---
name: product-gap-grooming-CAR-194
description: PM product-gap & backlog grooming pass (CAR-194) — prioritized findings for the climate game's core user journeys, deduped against the existing backlog and the prior CAR-173 pass.
type: reference
last_reviewed: 2026-06-26
---

# Product Gap & Backlog Grooming Pass — CAR-194

PM quality-loop pass. Reviewed the carbon-capture climate-strategy game
(`index.html` launch/menu, `game.html` play screen, `game.js` logic) against its
core user journeys: launch / Continue → difficulty & granularity setup → play
(select region, build projects, adjust carbon-tax, advance months/years, react
to events) → win/lose → restart/exit → resume.

## Method

- Traced all seven journeys end-to-end in `game.js`/`game.html`/`index.html`,
  verifying every finding against the actual code (line refs below).
- Cross-checked the **79 open issues** plus the prior pass doc
  `docs/product-gap-grooming-CAR-173.md` (which filed the autosave indicator →
  CAR-186 and exit confirm → CAR-187). The backlog is **heavily groomed** for
  product gaps already: tutorial-on-any-difficulty (CAR-104), win-condition
  surfacing (CAR-141/162), glossary (CAR-143), export/import (CAR-164),
  Continue-shows-save (CAR-165), difficulty details on launch (CAR-163),
  world-map/noscript fallbacks (CAR-100/159), silent empty/dead states
  (CAR-105/139), per-achievement progress (CAR-142), goal-deadline contradiction
  (CAR-102), a11y (CAR-71/101/137/138), GDP→income bug (CAR-166).
- Only genuinely-new, small, reversible gaps are filed.

## Findings (prioritized) — all filed as backlog issues

| # | Issue | Pri | Gap |
|---|-------|-----|-----|
| 1 | **CAR-198** | High | Dismissing the endgame results modal (X / overlay) drops the player onto a frozen-but-still-clickable board with no path forward and no way to reopen results — a dead end at the climax. |
| 2 | **CAR-199** | Med | Win/lose goal copy omits the actual rules: win needs a **12-month** sustained hold ≤ +1.0°C (`winStreakMonths >= 12`); defeat on 3 consecutive bad months (`loseStreakMonths >= 3`). Distinct from CAR-102 (deadline year). |
| 3 | **CAR-200** | Med | "Advance 1 Year" runs 12 `nextMonth()` ticks in one synchronous frame with no intermediate or end-of-year summary — the core cause→effect feedback is invisible on the most-used fast-forward. |
| 4 | **CAR-201** | Med | No persistent difficulty indicator in the play HUD; difficulty is shown once as a transient news line that scrolls away. Distinct from CAR-163 (launch-screen details). |
| 5 | **CAR-202** | Low | `skipTutorial()` tells players to replay via a menu round-trip (which wipes the save) when an in-game "How to play" button already does it. One-string copy fix. |
| 6 | **CAR-203** | Low | "Countries (~250 regions)" granularity is offered with equal weight to Continents but silently degrades (no group-hover) and is heavier — no advanced/slower caption. |

### Key evidence (verified)
- **#1** `showEndgameResultsModal()` wires X + overlay to `closeEndgameResultsModal()` (`game.js:15220-15221`); after `state.gameOver` only `nextMonth`/`advanceOneYear`/`saveGame`/build/campaign are guarded (`6651, 10723, 11044, 11514, 13558, 14271, 14429`); region select is not. Next-Month/Advance-Year buttons only `disabled` (`15256, 15259`).
- **#2** `checkWinLose()` win on `winStreakMonths >= 12` (`game.js:15237`), lose on `loseStreakMonths >= 3 || year > loseYear` (`15240`). Copy at `index.html:41`, `game.html:131`, `game.html:377` states only a point-in-time +1.0°C goal.
- **#3** `advanceOneYear()` tight `for (i<12)` loop, breaks only on game-over/open prompt (`game.js:11042-11054`).
- **#4** Difficulty surfaced once: `pushMessage(... ${difficulty.name} difficulty.)` (`game.js:8395`); news log capped (`15290`).
- **#5** `skipTutorial()` message at `game.js:6008`; in-game "How to play" → `window.startTutorial()` (`game.html:170`, `game.js:15572-15575`).
- **#6** `game.html:234-237`; country-level skips group hover (`game.js:7894, 7941`).

## Considered but NOT filed (dedup / low-signal)
- No settings/audio screen / explicit "reset save" affordance → soft, partly
  speculative (reset exists implicitly via "New Game erases save", `index.html:130`);
  audio may be intentionally absent. Left for the Designer's UX audit (CAR-190).
- Carbon-tax slider, can't-afford, world-map fallback, load-failure notice,
  Continue-shows-save → already covered (CAR-105/100/144/165) per CAR-173.

## Disposition
Six new, small, reversible issues filed (CAR-198…203), one High. Backlog
confirmed well-groomed; nothing else rose above the noise floor this pass.
