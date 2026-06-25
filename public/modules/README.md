# `public/modules/` — wiring status (read before editing)

A modularization was started (`dc17c57 refactor: modularize codebase with ES modules`)
but only partially completed. **Only `data/` is actually loaded by the running game.**

| Subtree | Status | Loaded by the build? |
| --- | --- | --- |
| `data/` | **LIVE** | ✅ Imported by `game.js` (`import … from "./public/modules/data/index.js"`). Edit here for data changes. |

## History

The orphaned sibling subtrees (`config/`, `systems/`, `ui/`, `utils/`) and the top-level
modular `styles/*.css` tree were stale parallel copies of logic that actually ships inside
the monolithic `game.js` / `style.css`. They were never imported anywhere, were copied
verbatim into `dist/` on every build (~260 KB of dead deploy weight), and risked silent
drift when a fix landed in `game.js` but not its dead copy. They were **deleted** in the
CAR-113 performance pass (executing tracked tech-debt issue **CAR-67** from the CAR-61
architecture review). Fully recoverable via git history if the migration is ever resumed.

## What to do

- **Editing gameplay/config/systems/ui logic:** edit `game.js`. It is the single source of
  truth for gameplay logic and config.
- **Editing region/country/project *data*:** edit `data/` (it is live).
- **Editing styles:** edit the shipped monolithic `style.css` referenced by `game.html`.
