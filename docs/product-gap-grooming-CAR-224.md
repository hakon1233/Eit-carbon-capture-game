---
name: product-gap-grooming-CAR-224
description: PM product-gap & backlog grooming pass (CAR-224) — prioritized findings for the climate game's core user journeys, deduped against the existing backlog and the prior CAR-173 / CAR-194 passes.
type: reference
last_reviewed: 2026-06-26
---

# Product Gap & Backlog Grooming Pass — CAR-224

PM quality-loop pass. Reviewed the carbon-capture climate-strategy game
(`index.html` launch/menu, `game.html` play screen, `game.js` logic, `style.css`)
against its core user journeys: launch / Continue → difficulty & granularity
setup → play (select region, build/upgrade projects, adjust carbon-tax, advance
months/years, react to events) → win/lose → restart/exit → resume → tutorial/help
→ achievements/stats.

## Method

- Traced all journeys end-to-end in the actual code, verifying every finding
  against line refs.
- Cross-checked the **83 open issues** plus the two prior PM passes
  (`docs/product-gap-grooming-CAR-173.md` → CAR-186/187;
  `docs/product-gap-grooming-CAR-194.md` → CAR-198…203) and the gap-tracking
  docs (`docs/TODO.md`, `docs/NICE-TO-HAVE.md`). The backlog is **heavily
  groomed** for product gaps already (tutorial-on-any-difficulty CAR-104,
  win/lose surfacing CAR-141/162/199, advance-year feedback CAR-200, difficulty
  HUD CAR-201, autosave indicator CAR-186, exit confirm CAR-187, endgame dead-end
  CAR-198, glossary CAR-143, export/import CAR-164, continue-shows-save CAR-165,
  silent/empty states CAR-105/139/144, per-achievement progress CAR-142,
  end-of-run achievements CAR-214, a11y CAR-71/101/137/138/197, GDP→income bug
  CAR-166, news-history CAR-213, brand CAR-49).
- Only genuinely-new, small, reversible gaps are filed.

## Findings (prioritized) — all filed as backlog issues

| # | Issue | Pri | Gap |
|---|-------|-----|-----|
| F1 | **CAR-227** | High | Only the month-tick and research-center builds autosave. The most common mid-month actions — `startConstruction` (build/replace, both paths), alliance form/fail, negotiation initiation (deducts funds), and carbon-tax rate/growth changes — never call `saveGame()`, so a refresh/close silently rolls back that work **and** the spent budget. Inconsistent with the autosave/Continue promise; distinct from CAR-186 (indicator only). |
| F2 | **CAR-228** | Med | `game.html:369` tells players *"Achievements are tracked across sessions,"* but achievements live only inside the single save blob (`SAVE_KEY`), which is cleared on new game (`index.html`), `initGame()` (`game.js:10400`), and game-over (`game.js:15273`). No separate persistent store exists — direct copy/behavior contradiction that kills the meta-progression hook. |
| F3 | **CAR-229** | Low | "How to play" and "Restart" live in `#header-controls`, which is `display:none` during setup (`game.html:194`) and only revealed at `confirmSetupAndStartGame` (`game.js:8346`). A first-time player on the region-setup screen cannot open the tutorial or reset their selection without leaving to the menu — help is missing at the first decision point. |

### Key evidence (verified)
- **F1** `saveGame()` call sites are exactly 6: `game.js:2529, 2569, 2659` (research center), `8361` (setup confirm), `10989` (`nextMonth`), `12611`. `startConstruction`, alliance accept/reject, `initiateNegotiation`, `updateCarbonTaxRate`/`updateCarbonTaxGrowth` are absent from the list.
- **F2** Copy at `game.html:369`. `grep localStorage game.js` shows only `SAVE_KEY`, `collapsedSections`, `gameDifficulty` — no achievement key. `clearSavedGame()` at `game.js:6718`, called at `10400` and `15273`.
- **F3** `game.html:194` `#header-controls … style="display: none;"`; revealed in `confirmSetupAndStartGame` (`game.js:8346`). Tutorial bound at `game.js:15652` (`window.startTutorial`).

## Considered but NOT filed (dedup / low-signal / wrong lane)
- **Advance-1-Year halts silently for an event with no message** (`advanceOneYear` `game.js:11002`–11014 `break`s with no `pushMessage`). Real, but the same area is already tracked by **CAR-200** ("Advance 1 Year … no intermediate or summary feedback"); folded in rather than re-filed — the one-line "Advanced N months — paused for an event" message belongs in CAR-200's scope.
- **`pushMessage` `"warning"`/`"info"` tones render as plain neutral notes** (icon map `game.js:15295`–15300 covers only good/bad/neutral; CSS styles only `.news-item.good`/`.bad`). Concrete and small, but squarely a visual-styling matter in the Designer's lane — **deferred to the Design/UX audit (CAR-220, in progress)**.
- **Best-score / run-history persistence** (`calculateEndgameScore` result shown once, never stored). Already tracked broadly by `docs/NICE-TO-HAVE.md:85` ("Player stats and leaderboards") and the achievement-system note; not re-filed.

## Disposition
Three new, small, reversible issues filed (CAR-227 High, CAR-228 Med, CAR-229
Low). Backlog confirmed well-groomed across three consecutive PM passes; the
remaining candidates were deduped, folded into existing issues, or routed to the
Design/UX audit. Nothing else rose above the noise floor this pass.
