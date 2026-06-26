---
name: system-overview
description: Top-level entry point for the Carbon Capture Game — what it does, architecture, key workflows. Links out to detailed subfolder docs.
type: explanation
last_reviewed: 2026-06-26
---

# System Overview

## What is this

The **Carbon Capture Game** is a browser-based strategy game about managing the
planet's carbon balance. The player acts as a global climate authority: forming
alliances with world regions, funding clean-power build-out, deploying carbon
capture & storage (CCS) and direct-air-capture (DAC) projects, and researching
technology — all to hold global warming at or below **+1.0 °C** through to 2050
without letting it cross the **+2.0 °C** loss threshold. It is built as a teaching
and demo tool (school / EiT project context), so it runs entirely in the browser
with no sign-up, no backend, and no data to install.

## Architecture

The game is a **pure static front-end** — vanilla JavaScript bundled by
[Vite](https://vitejs.dev), with no server, no database, and no environment
variables. All simulation logic lives in a single large module, `game.js`
(~16k lines), which owns the `state` object and the monthly simulation loop;
gameplay tuning lives in one config block (`GAME_CONFIG` near the top of
`game.js`) plus shared data modules under `public/modules/data/` (e.g.
`difficulty-modes.js`, which exports `DIFFICULTY_MODES`). The app is **multi-page**:
`vite.config.js` wires eight HTML entry points — `index.html` (launch / difficulty
select), `game.html` (the playable game), and the static reference pages
`rules.html`, `systems.html`, `game_mechanics.html`, `game_rules.html`,
`Game_Data_Reference.html`, and `Emissions_Data_Reference.html`. The build is
served under the base path `/Eit-carbon-capture-game/`. State is persisted to
`localStorage` (key `carbonCaptureGameSave`) — there is no remote save.

The heart of the simulation is `nextMonth()`, run once per in-game month. Each
tick, in order: advances the calendar; updates regional power grids, GDP, and
sector emissions; recomputes the carbon balance (emissions − removals);
processes in-flight construction; applies the CO₂ change (scaled by the chosen
difficulty's `co2Multiplier` plus climate-feedback / tipping-point effects);
collects climate-finance income from **allied** regions only; derives the new
global temperature from CO₂; fires random **events** and rolls for disasters; then
updates the win/lose streaks and calls `checkWinLose()`. A win requires the
temperature to stay at or below the target for a **sustained 12-month streak**
(from 2050 onward); the game is lost on a 3-month streak above +2.0 °C or once the
calendar passes the lose year (2100).

See [docs/architecture/](architecture/) for component structure and data flow, and
[docs/decisions/](decisions/) for the ADRs behind key choices.

### Key subsystems

- **Regions / world map** — an interactive SVG map; each region carries its own
  power grid, GDP, and per-sector emissions, and must be allied before it
  contributes income.
- **Projects / CCS** — clean-power and carbon-removal projects (CCS capture,
  transport, storage, integrated hubs, and DAC) with per-region build caps.
- **Alliances & technology** — diplomacy gates each region's climate-finance
  income; a research/tech system unlocks and improves project options over time.
- **Achievements** — milestone tracking surfaced during play.
- **Save / load** — single-slot autosave to `localStorage`; cleared on game over.

## Key workflows

The primary workflow is **playing the game**: open `index.html`, pick a difficulty
(Tutorial / Easy / Normal / Hard / … from `DIFFICULTY_MODES`), then play in
`game.html` — ally regions, build power and capture projects, research tech, and
advance month-by-month while holding the climate line. Behavioural specs and a
walkthrough of how each system works live in
[docs/system/](system/) (see `how-the-system-works.md`).

## Development

No backend or environment setup is required:

```
npm install     # install dependencies
npm run dev      # start Vite dev server (http://localhost:5173/Eit-carbon-capture-game/)
npm run build    # produce the static production bundle in dist/
```

End-to-end tests run with `npm run test:e2e` (Playwright). For the day-to-day
agent improvement workflow, see
[docs/runbooks/improvement-loop.md](runbooks/improvement-loop.md).
