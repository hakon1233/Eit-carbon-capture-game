# Performance & Bundle-Size Pass — CAR-113

_Repo Maintainer recurring quality pass. Date: 2026-06-25. Measured against `vite build`
(v5.4.21). Fourth pass in this series; read [CAR-59](./perf-bundle-pass-CAR-59.md) (the
substantive pass), [CAR-80](./perf-bundle-pass-CAR-80.md), and
[CAR-95](./perf-bundle-pass-CAR-95.md) first._

## TL;DR

This pass **executed a tracked, clearly-safe win that had sat unactioned in the backlog**:
deleted the orphaned `public/modules/{config,systems,ui,utils}/` subtrees and the top-level
modular `styles/*.css` tree (tracked as **CAR-67**, HIGH). These were dead parallel copies
of logic that ships inside the monolithic `game.js` / `style.css` — never imported, copied
verbatim into `dist/` on every build (**~260 KB raw of dead deploy weight removed**), and a
standing silent-drift hazard. Build stays green; the bundled `game.js` is byte-identical
(341.88 kB / 92.44 kB gzip), proving the trees were truly inert. Everything else that moves
the needle is already correctly tracked and was re-verified, not re-filed.

## How this was measured

`npx vite build` → `dist/` report (raw + gzip), per-asset `ls`/`gzip -c | wc -c`, import-graph
grep across `game.js` + `public/modules/`, and a hot-path scan of `game.js`
(`setInterval`/`requestAnimationFrame`/`setTimeout`/`innerHTML`). Tooling probe: `svgo` still
**not installable offline** (npx cannot fetch `svgo@4.0.1`), so CAR-106 remains genuinely
blocked here.

## Current build snapshot (game screen)

| Asset (game screen) | raw | gzip | Notes |
| --- | --- | --- | --- |
| `assets/maps/mapsvg-world-world.svg` | 1.24 MB | **394 KB** | largest runtime asset — tracked **CAR-106** (needs svgo) |
| `game.js` | 341.88 kB | 92.44 kB | monolith — extraction tracked **CAR-69** |
| `style.css` | 123.82 kB | 21.26 kB | dead-rule pruning tracked **CAR-66** |
| `horizontal-dark.svg` (launch logo) | 19.84 kB | 9.71 kB | ✅ subset in CAR-95 (was 160.55 kB gz) |

## Findings

### 1. ✅ FIXED — Deleted ~260 KB of orphaned dead code from the build (CAR-67)

`game.js` imports **only** `./public/modules/data/index.js`. The sibling subtrees
`public/modules/{config,systems,ui,utils}/` (~196 KB) and the top-level `styles/*.css`
tree (~68 KB) were not imported, fetched, or `<link>`ed anywhere (verified by grep across
`*.js`/`*.html`/`*.css`, excluding `node_modules`/`dist`). Vite copies `public/` verbatim,
so they shipped into `dist/modules/` and `dist/styles/` as pure dead weight on every build.

**Fix applied:** `git rm` the five orphaned trees; updated `public/modules/README.md` to
reflect that only `data/` remains. Kept `public/modules/data/` (live) and `style.css` /
`game.js` gameplay untouched, exactly per CAR-67's scope.

**Why it's safe / reversible:** the bundled `game.js` is **byte-identical** before and after
(341.88 kB — the trees were never in the module graph), `vite build` stays green, and the
change is a single commit fully recoverable from git history. This closes **CAR-67** and
removes the recurring double-maintenance/silent-drift tax called out by the CAR-61
architecture review.

### 2. OPEN (already tracked, NOT re-filed)

- **`mapsvg-world-world.svg` — 1.24 MB / 394 KB gzip**, the single largest runtime asset on
  the game screen. Tracked **CAR-106** (svgo `convertPathData`/`cleanupNumericValues`).
  Still blocked: svgo is not installable offline this pass. The file is already structurally
  lean (paths only, one comment, no metadata/style/script blocks), so the remaining win is
  coordinate-precision reduction — exactly svgo's job and not a clearly-safe hand edit.
- **`style.css` 124 KB (21 KB gz)** dead-rule pruning + optional lazy data chunk. Tracked
  **CAR-66** (backlog, low).
- **`game.js` 15.7k-line monolith** incremental extraction. Tracked **CAR-69** (backlog, low).

## Not a problem (re-confirmed)

- **Runtime hot paths / re-renders:** turn-based. `game.js` has **no** `setInterval` and no
  rAF/animation loop — the only two `requestAnimationFrame` calls are one-shot
  post-layout deferrals, not per-frame loops. The 67 `innerHTML` writes and 14 `setTimeout`
  calls fire on discrete user actions (`nextMonth()`, clicks), not per frame. No N² rebuild.
- **Network:** static single-page build; no N+1/waterfall fetches; data is bundled into
  `game.js`. Game screen loads `style.css` (render-blocking), `game.js` (module), and the
  map SVG via `<object>`.
- **Large reference HTMLs** (`game_mechanics.html` 150 KB, `Game_Data_Reference.html` 87 KB,
  etc.) are **not** loaded on the game screen — they are separate linked pages, so they do
  not affect game-screen load. Legitimately linked from `index.html` / rules pages.

## Net result of this pass

One tracked, clearly-safe, reversible change landed: **~260 KB of dead source/deploy weight
removed** and **CAR-67 closed**, with the shipped bundle provably unchanged. The three
needle-moving items (map SVG / dead CSS / monolith extraction) remain correctly tracked and
open; nothing was re-filed. Build green.
