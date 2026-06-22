# `public/modules/` — wiring status (read before editing)

A modularization was started (`dc17c57 refactor: modularize codebase with ES modules`)
but only partially completed. **Only one subtree is actually loaded by the running game.**

| Subtree | Status | Loaded by the build? |
| --- | --- | --- |
| `data/` | **LIVE** | ✅ Imported by `game.js` (`import … from "./public/modules/data/index.js"`). Edit here for data changes. |
| `config/` | **ORPHANED** | ❌ Not imported anywhere. A stale parallel copy of config that ships in `game.js`. |
| `systems/` | **ORPHANED** | ❌ Not imported anywhere. |
| `ui/` | **ORPHANED** | ❌ Not imported anywhere. |
| `utils/` | **ORPHANED** | ❌ Not imported anywhere. |

The CSS equivalent `styles/*.css` (modular) is likewise orphaned — the shipped
stylesheet is the monolithic `style.css` referenced by `game.html`.

## Why this matters

The single source of truth for gameplay logic and config is the monolith **`game.js`**
(and `style.css` for styles). Several recent bug-fix commits edited *both* `game.js` and
`public/modules/config/projects.js` in lockstep — i.e. they hand-maintained the dead copy,
paying double and risking silent drift between the two. **Changes made only to the orphaned
subtrees never reach players.**

## What to do

- **Editing gameplay/config/systems/ui logic:** edit `game.js`. Do **not** touch the
  orphaned subtrees above expecting your change to ship.
- **Editing region/country/project *data*:** edit `data/` (it is live).
- The long-term cleanup (finish the migration, or delete the orphaned subtrees) is tracked
  as a fix-issue from the CAR-61 architecture review. Until that lands, treat this table as
  authoritative.
