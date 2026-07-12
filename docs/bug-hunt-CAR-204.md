# CAR-204 — Engineer bug-hunt & fix pass (findings)

Date: 2026-07-12
Agent: Engineer (cb223f72)
Cycle: `8c62c796-5a33-4cb4-abb7-cc05a8848ad0:1782443244563`
Scope: Bug hunt over `game.js` (~16.3k lines) + node regression guards. Findings
independently verified by reading the surrounding code before filing.

## Housekeeping (done this pass)

- **Rescued a stranded commit.** A prior heartbeat committed `9b78587`
  ("harden quality-pass edge cases") but never pushed it; origin had advanced
  (CAR-398). Rebased onto current `main`, re-verified `npm run build` + full
  Playwright suite (35/35), pushed. Now on origin.
- **Fixed BUG-004 (MATRIX_BUG).** That rescued commit added a
  `clearEventPopups()` call inside `showEndgameResultsModal()`, but the node
  harness `scripts/test-endgame-results-modal.mjs` sandboxes that function and
  had no stub for the new dependency → `ReferenceError`, so the guard silently
  stopped running. The Playwright suite passed (real `clearEventPopups` exists);
  nothing in CI/husky runs the `scripts/test-*.mjs` guards, so the break was
  invisible. Fixed the harness (counted stub + a positive assertion that the
  modal clears popups, mutation-checked) and added `npm run test:regression`
  so every `scripts/test-*.mjs` runs in one command. See `.claude/bugs/`.

## Confirmed findings (filed as fix-issues, not fixed here — balance/refactor risk)

Ranked most-severe first. Each was confirmed by reading the reachable code path.

### F1 (HIGH) — Campaign/negotiation climate-finance progress mutates a module singleton, not `state`
- **Where:** `game.js:11142`, `game.js:11166` (`processCampaigns`), `game.js:10181-10206` (alliance-accept handler). Read live in income calc at `game.js:10660` / `game.js:10844`.
- **Defect:** These write `climateFinance.currentPercent`/`.maxPercent` directly onto the imported `CLIMATE_DATA.COUNTRY_DATA[...]` singleton (imported at `game.js:9`, `game.js:34`). `saveGame()` (`game.js:6630`) serializes only `state`; the overrides live outside `state`.
- **Failure A (save/load loss):** Player campaigns/negotiates a region up to higher climate dedication, reloads the page. ES modules re-evaluate, resetting `COUNTRY_DATA` to file defaults (~2-3%). All progress silently vanishes and that region's monthly climate-finance income drops, no message. `state.alliance[...].carbonTax` survives (it's in `state`) — inconsistent restore.
- **Failure B (cross-game leak):** `initGame()` never resets `COUNTRY_DATA`, so a new game (without a page reload) inherits the previous run's inflated `currentPercent`/`maxPercent`.
- **Suggested fix:** Store per-region climate-finance overrides in `state` (e.g. `state.climateFinanceOverrides[regionId]`); apply from there in income calc + on load; reset in `initGame()`. Stop mutating the imported `COUNTRY_DATA`.

### F2 (HIGH) — `REGIONAL_PROJECT_CAPS` is not enforced in the real build path
- **Where:** live build buttons call `buildProjectWithEffectiveness()` (`game.js:14387`, `game.js:14545`) → `executeEffectivenessBuild()` (`game.js:14734`); neither checks caps. The only cap check is in `buildProject()` (`game.js:11570-11586`), which has **zero real callers** (only comment references remain — dead code).
- **Failure:** In any normal game, build 10 nuclear plants in one region (cap 2) or 20 forests (cap 3). No message, no block — the "limited suitable sites" balance constraint (`game.js:128-160`) is entirely inert for the player.
- **Suggested fix:** Port the cap check from `buildProject()` into `buildProjectWithEffectiveness()` (count existing `region.projects` of that type **plus** queued `state.underConstruction` of that `type`) before showing the dialog / committing. Balance-affecting — flag for QA-live re-validation.

### F3 (MEDIUM) — Campaign cost/duration quote omits the 1.5× aggregate multiplier the charge applies
- **Where:** display `game.js:13659-13660` (in `renderRegionIncome`) vs charge `game.js:11269-11272` (in `startClimateCampaign`).
- **Defect:** The charge multiplies cost and duration by `aggregateMultiplier` (1.5 when `regionData.isAggregate`); the display does not. At the default "continents" granularity every region is an aggregate, so the quote is ~33% low. The button's `disabled` state (`game.js:13673`) uses the low displayed cost.
- **Failure:** Funds between the displayed cost and 1.5× it → button looks affordable, click hits the `state.funds < cost` gate in `startClimateCampaign` and prints "Cannot afford" — the button lies.
- **Extra wrinkle for the fixer:** display resolves region data via `getClimateDataForRegion(selectedRegionId)` (`game.js:13444`) while the charge uses `getRegionClimateData(regionId)` — two different functions. A correct fix should quote from the **same** source/formula as the charge (ideally extract one shared `campaignQuote(regionData)` helper used by both) so display == charge exactly, not just bolt 1.5× onto the display.

### F4 (LOW) — Embodied-carbon emissions always assume `capacityGW = 1`
- **Where:** `calculateEmbodiedCarbon()` reads `construction.capacityGW || 1` (`game.js:853`), but neither `startConstruction()` (`game.js:11421`) nor `executeEffectivenessBuild()` (`game.js:14784`) stores `capacityGW`/`storageGWh` on the queued record.
- **Failure:** A 1.2 GW nuclear build reports embodied carbon as if 1 GW (~17% low); a 20 GWh battery (0.05/GWh) is computed as 1 → ~20× understated, for the whole build period. No crash — embodied carbon is a small term vs total emissions.
- **Suggested fix:** Store `capacityGW: project.capacityGW` (and `storageGWh`) when pushing to `underConstruction`, or look it up from `PROJECT_TYPES[construction.type]` inside `calculateEmbodiedCarbon()`. Balance-adjacent (raises construction-phase emissions for large projects) — flag for QA-live.

## Areas checked and found solid (no concrete defect)

Temperature formula, carbon-balance ppm conversion, ocean/land absorption, feedback
loops/tipping points, disaster lifecycle, `getEmissionsTrend` bounds guard, power
supply/stability recomputation (no cumulative double-count), win/lose streak logic,
save/load migrations (`loadGame` has extensive defensive migrations), and the
JSON-serializability of `state`.

## Recommendation for the Repo Maintainer / CTO (systemic, not filed as a bug)

The 16 `scripts/test-*.mjs` regression guards run **nowhere automatically** — husky
only validates commit messages, CI (`.github/workflows/deploy.yml`) only runs
`npm run build`, and there was no npm script for them. That is exactly how BUG-004
shipped unnoticed. This pass added `npm run test:regression`; wiring it (and/or
`test:e2e`) into a husky pre-push hook or CI is a small follow-up worth doing.
