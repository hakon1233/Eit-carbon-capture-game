# Carbon Capture: Climate Overseer

A browser-based strategy game about steering the planet's carbon balance. You play a
global climate authority — ally with world regions, build clean power, deploy carbon
capture (CCS) and direct-air-capture projects, and hold global warming at or below
**+1.0 °C** through 2050 without crossing the **+2.0 °C** loss line.

**Play it:** <https://hakon1233.github.io/Eit-carbon-capture-game/>

## What's behind it

The game is a simulation, not a scripted scenario. Each turn advances a model that
tracks atmospheric CO₂ in ppm, converts it to warming, and feeds that back into how
regions behave.

- **Real-world data.** Emissions are modelled per country and per sector, aggregated
  into regions, seeded from published figures — the IEA *World Energy Outlook 2025*
  is the primary source. Starting conditions use real values: 420 ppm atmospheric
  CO₂, a 280 ppm pre-industrial baseline, 1.2 °C of warming already banked. See
  [`data_sources.md`](data_sources.md), which also marks which figures still need a
  citation.
- **The tension is budgetary.** Clean power, CCS and DAC all compete for the same
  money on different timescales — cheap mitigation now versus expensive removal
  later — so the interesting decisions are about *when*, not *what*.
- **Regions are political.** Alliances gate what you can build where, so the optimal
  climate move and the achievable one are rarely the same.

Difficulty modes change starting capital, build costs and how severe random events
get — not the underlying physics.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173/Eit-carbon-capture-game/
```

Open that URL to pick a difficulty, or go straight to `…/game.html` to play.

```bash
npm run build    # static bundle to dist/
npm run preview  # serve the production build
```

No backend, no database, no environment variables, and **no runtime dependencies** —
it is vanilla JavaScript built with [Vite](https://vitejs.dev). The whole thing is a
static bundle that GitHub Pages serves as-is.

## Tests

```bash
npm run test:e2e   # 38 Playwright end-to-end tests
```

The suite drives a real browser through the game — building projects, forming
alliances, and checking that the rules actually refuse illegal moves (for example,
that a region at its nuclear cap rejects the build *before* the dialog opens and
without spending money) rather than merely hiding the buttons.

## Layout

| Path | What lives there |
|------|------------------|
| `index.html` | Launch and difficulty select |
| `game.html`, `game.js` | The playable game and its simulation |
| `public/modules/data/` | Country, region, sector and project data |
| `tests/e2e/` | Playwright suite |
| `docs/` | Design and system documentation — [start here](docs/SYSTEM_OVERVIEW.md) |

> **A note on `game.js`:** it is one large file. The simulation grew faster than its
> structure did, and splitting it is the obvious next refactor.

## Licence

MIT — see [LICENSE](LICENSE).
