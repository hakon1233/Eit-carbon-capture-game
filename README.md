# Carbon Capture: Climate Overseer

A browser-based strategy game about steering the planet's carbon balance. You play
a global climate authority — ally with world regions, build clean power, deploy
carbon capture (CCS) and direct-air-capture projects, and hold global warming at
or below +1.0 °C through 2050 without crossing the +2.0 °C loss line.

Pure static front-end (vanilla JS + [Vite](https://vitejs.dev)) — no backend, no
database, no environment variables.

## Run it locally

```bash
npm install
npm run dev     # vite serves on http://localhost:5173/Eit-carbon-capture-game/
```

Open `http://localhost:5173/Eit-carbon-capture-game/` to pick a difficulty, or go
straight to `…/game.html` to play.

## Build

```bash
npm run build    # outputs the static bundle to dist/
npm run preview  # serve the production build locally
```

## Tests

```bash
npm run test:e2e # Playwright end-to-end tests
```

## Where things live

- `index.html` — launch / difficulty select
- `game.html` / `game.js` — the playable game and all simulation logic
- `docs/` — project documentation ([start here](docs/SYSTEM_OVERVIEW.md))
- `CLAUDE.md` / `AGENTS.md` — agent & contributor working guide
