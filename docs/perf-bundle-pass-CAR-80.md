# Performance & Bundle-Size Pass — CAR-80

_Repo Maintainer recurring quality pass. Date: 2026-06-22. Measured against `vite build`
(v5.4.21). This is a re-pass; the substantive pass earlier the same day was
[CAR-59](./perf-bundle-pass-CAR-59.md) — read that first._

## TL;DR

The recent CAR-59 pass already landed the one big clearly-safe win (−4.3 MB of unused
candidate maps) and filed the remaining items as small backlog fix-issues. This re-pass
**re-measured, confirmed those findings still hold, and found nothing new worth filing or
fixing**. No code changed.

## How this was measured

`npm run build` → `dist/` report (raw + gzip), plus per-asset `ls`/`du`, and a hot-path
scan of `game.js` (timers, animation loops, per-tick rebuilds).

## Current build report (deployed assets)

| Asset | Raw | Gzip |
|-------|-----|------|
| `assets/horizontal-dark-*.svg` (launch logo) | 339.33 kB | **160.55 kB** |
| `assets/game-*.js` (whole game) | 341.38 kB | 92.26 kB |
| `assets/style-*.css` | 123.72 kB | 21.25 kB |
| `game_mechanics.html` | 150.06 kB | 26.07 kB |
| `index.html` | 5.55 kB | 1.85 kB |

`du -sh dist` ≈ 2.8 MB (down from ~6.9 MB pre-CAR-59). Build is green.

## Verification of prior pass

- ✅ CAR-59 finding #1 landed: `public/assets/maps/` now holds only the one runtime map
  (`mapsvg-world-world.svg`); the candidate SVGs are gone from the served tree. `dist`
  confirmed ~2.8 MB.

## Open items — already tracked, NOT re-filed

Per the recurring-pass guardrail (don't duplicate tracked work), these remain the right
backlog items and are unchanged:

1. **Launch-screen logo SVG — 339 KB / 160 KB gz** on first paint (largest shipped asset
   after the JS). Embeds the full Oswald TTF as base64 for live `<text>` (CLIMATE /
   OVERSEER). Tracked: _"[perf] Shrink 339KB launch-screen logo SVG"_ (backlog).
   - Note for that issue: the fix can be **vector-preserving** (subset the embedded font
     to the ~11 glyphs `ACEILMORSTV`, or outline the text to paths) — that avoids the
     SVG→PNG design call entirely. Both need font/SVG tooling (`pyftsubset` / `svgo`),
     which is **not installed in this offline environment**, so it can't be applied as an
     ad-hoc safe win here.
2. **`style.css` 123 KB (21 KB gz)** likely-dead rules + optional lazy data chunk for
   `game.js`. Tracked: _"[perf] Prune dead CSS … lazy data chunk"_ (backlog, low pri).
3. **`game.js` 15.7k-line monolith** incremental extraction. Tracked (backlog).
4. **Orphaned `public/modules/{config,systems,ui,utils}`** still copied verbatim into
   `dist/modules/` (~348 KB) though never fetched at runtime (game.js imports only
   `public/modules/data/`). Tracked for deletion: **CAR-67**. _(Pure deployed-artifact
   weight — the browser never requests these, so no runtime/first-paint impact; correctly
   low priority.)_

## Not a problem (re-confirmed with evidence, not just reasoning)

- **Runtime hot paths / re-renders:** game is turn-based. `game.js` has **no
  `setInterval`/`setTimeout` loop and no animation frame** — work runs only on discrete
  user actions (`nextMonth()`, button clicks). `updateUI()` and `updateMapColors()` each
  iterate the region set exactly once per action; no per-frame or N² rebuild. 65
  `innerHTML` writes and 21 `querySelectorAll` calls are all event-driven, not looped.
- **Network:** static single-page build, no N+1/waterfall fetches; data is bundled.
- **Unreferenced logo variants** (`horizontal-light`, `stacked-*`, each ~338 KB) live in
  `brand/` (not `public/`) and are not referenced by any shipped HTML, so Vite does
  **not** ship them — confirmed absent from `dist/assets/`.

## Net result

No change applied this pass — the codebase is already in the state CAR-59 left it, and the
outstanding items are correctly tracked. The single highest-leverage remaining win stays
the launch-screen logo (160 KB gz on first paint); its blocker is tooling/design sign-off,
not discovery.
