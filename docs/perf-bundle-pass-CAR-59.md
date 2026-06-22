# Performance & Bundle-Size Pass — CAR-59

_Repo Maintainer quality pass. Date: 2026-06-22. Measured against `vite build` (v5.4.21)._

## How this was measured

`npx vite build` produces the deployed `dist/`. Numbers below are raw + gzip from the
build report, plus `du -sh dist` and per-asset `ls`.

## Findings (prioritized by leverage)

### 1. ✅ FIXED — ~4.3 MB of unused candidate map SVGs shipped to every visitor

Everything under `public/` ships verbatim. `public/assets/maps/` held ten files, but
only `mapsvg-world-world.svg` (1.2 MB) is fetched at runtime (game.js:5936-5948). The
rest were source/candidate maps downloaded for evaluation (see the old
`download-manifest.json`) with **zero** code references:

| File | Size |
|------|------|
| blankmap-world-flattened.svg | 1.77 MB |
| blankmap-world.svg | 1.10 MB |
| continents-outlines.svg | 1.05 MB |
| simplemaps-world.svg | 0.15 MB |
| riskgameboard.svg | 0.04 MB |
| + 5 small logo/leftover svgs + manifest | ~0.01 MB |

**Fix applied:** moved them to `design-assets/maps/` (repo-tracked, not under `public/`,
so not served). `mapsvg-world-world.svg` stays. Verified: build green, grep confirms 0
references to the moved files. **`dist/` dropped from ~6.9 MB → 2.8 MB.** Fully
reversible (git rename).

### 2. OPEN — Launch-screen logo is a 339 KB SVG (160 KB gzip) with an embedded font

`index.html` loads `brand/logo/horizontal-dark.svg` on the launch screen (first paint,
critical path). It is 339 KB because it base64-embeds the full Oswald TTF. A pre-rendered
`brand/logo/horizontal-dark@2x.png` already exists at **46 KB** and renders at the fixed
`height:72px`. Swapping to the PNG (or outlining the SVG text to paths) saves ~290 KB
(~133 KB gzip) on first paint. Format swap is a design call → fix-issue, not auto-applied.

### 3. OPEN — `game.js` ships as one 341 KB chunk (92 KB gzip)

Single monolithic bundle (15.7k source lines + data modules). For a turn-based game most
of it is needed at start, so this is lower-leverage, but the large static data modules
(`countries.js` 2.5k lines, `geography.js`, `region-aggregates.js`) are candidates for a
lazy-loaded data chunk if first-paint time becomes a concern. Fix-issue, low priority.

### 4. OPEN — `style.css` is 123 KB (21 KB gzip)

Large single stylesheet; likely contains dead rules from removed UI. Needs coverage
analysis (e.g. Chrome coverage tab) to prune safely. Fix-issue, low priority.

## Not a problem

- **Re-renders / hot paths:** game is turn-based (`nextMonth()`), not per-frame; 67
  `innerHTML` writes happen on discrete user actions, not in a loop. No needle-mover here.
- **`brand/fonts.css` (676 KB):** only referenced by `brand/brand-sheet.html`, which is
  not a build input — it does **not** ship.
- **`artifacts/` screenshots:** not under `public/` and not build inputs — not shipped.

## Net result of this pass

Deployed bundle: **~6.9 MB → 2.8 MB (~60% smaller)** with one clearly-safe, reversible
change. Items 2–4 filed as small fix-issues.
