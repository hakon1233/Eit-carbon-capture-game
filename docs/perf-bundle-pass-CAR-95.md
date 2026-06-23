# Performance & Bundle-Size Pass — CAR-95

_Repo Maintainer recurring quality pass. Date: 2026-06-23. Measured against `vite build`
(v5.4.21). Third pass in this series; read [CAR-59](./perf-bundle-pass-CAR-59.md) (the
substantive pass) and [CAR-80](./perf-bundle-pass-CAR-80.md) (re-pass) first._

## TL;DR

This pass **landed the single highest-leverage remaining win**: the 339 KB launch-screen
logo SVG is now **19.8 KB** (gzip **160.55 → 9.71 kB**, ~94% smaller) via embedded-font
subsetting — vector-preserving and pixel-identical. CAR-80 had this tracked but
**blocked on tooling** (`fonttools`/`pyftsubset` not installed); the tool is now present,
so it was applied as a clearly-safe direct fix. One genuinely new finding (the 394 KB-gzip
runtime map SVG was never evaluated for *optimization* by prior passes) is filed as a small
reversible backlog issue.

## How this was measured

`npx vite build` → `dist/` report (raw + gzip), per-asset `ls`/`gzip -c | wc -c`, and a
hot-path scan of `game.js` (timers, animation loops, network). Tooling probe:
`python3 -m fontTools.subset` (4.60.2) available; `svgo` not installable offline.

## Findings

### 1. ✅ FIXED — Launch logo SVG: 339 KB → 19.8 KB (160.55 → 9.71 kB gzip)

`index.html` loads `brand/logo/horizontal-dark.svg` on first paint. It base64-embedded
**three full font files** (Oswald 300, Oswald 700, Space Mono 700 — 84/84/78 KB) but the
lockup only renders ~17 glyphs (`CARBON · CAPTURE` / `CLIMATE` / `OVERSEER`).

**Fix applied (commit `b8af3b0`):** subset each embedded TTF to the glyphs actually used
(`fontTools.subset`, `--text`). Embedded fonts dropped 84→2 KB, 84→2 KB, 78→6 KB.

**Why it's safe / pixel-identical:** all SVG markup outside the three base64 blobs is
**byte-for-byte identical** to the original (verified by diffing with blobs masked); same
fonts, same `<text>`, same paths, same colours, same viewBox. Each subset font retains
full cmap coverage of every rendered character (verified). Valid XML; `vite build` green.
Fully reversible (single-file git revert). This resolves the vector-preserving option of
the tracked logo issue (`[perf] Shrink 339KB launch-screen logo SVG`) — that issue's only
remaining blocker per CAR-80 was the missing font tooling, which is now available.

### 2. OPEN (new, filed) — Runtime world-map SVG is 1.24 MB raw / **394 KB gzip**

`public/assets/maps/mapsvg-world-world.svg` is fetched on the game screen via
`<object data="assets/maps/mapsvg-world-world.svg">` (game.html:157; game.js:5939-5951).
At **394 KB gzip it is the single largest asset on the game screen** — larger than the
gzipped JS bundle (92 KB). Prior passes (CAR-59/80) only removed the *unused* sibling maps;
**neither evaluated optimizing the one map that ships.** It is a raw MapSVG-plugin export
with 6-decimal coordinate precision — the classic target for `svgo`
(`convertPathData` + `cleanupNumericValues`), which typically cuts such exports 30–50% with
no visible change at screen scale.

Could **not** be applied safely in this pass: `svgo` is not installed and npx cannot fetch
it offline; hand-reducing path precision risks visibly shifting borders, so it is not a
"clearly-safe" ad-hoc edit. Filed as a small reversible fix-issue with the exact command.

### 3–4. OPEN (already tracked, NOT re-filed)

- **`style.css` 123 KB (21 KB gz)** dead-rule pruning + optional lazy data chunk for
  `game.js`. Tracked: _"[perf] Prune dead CSS … lazy data chunk"_ (backlog, low pri).
- **`game.js` 15.7k-line monolith** incremental extraction. Tracked (backlog).
- **Orphaned `public/modules/{config,systems,ui,utils}`** copied into `dist/modules/`
  (~348 KB) but never fetched at runtime. Tracked for deletion: **CAR-67**.

## Not a problem (re-confirmed)

- **Runtime hot paths / re-renders:** turn-based; `game.js` has no
  `setInterval`/`setTimeout`/rAF loop — work runs only on discrete user actions
  (`nextMonth()`, clicks). No per-frame or N² rebuild.
- **Network:** static single-page build, no N+1/waterfall fetches; data is bundled.
- **Unreferenced logo variants** (`horizontal-light`, `stacked-*`) live in `brand/`, not
  referenced by shipped HTML → Vite does not ship them (absent from `dist/assets/`). Only
  `horizontal-dark.svg` ships, which is why only it was subset.

## Net result of this pass

One clearly-safe, reversible change landed: **launch-screen first paint drops ~151 KB
gzip** (160.55 → 9.71 kB for the logo). One new fix-issue filed (map optimization). All
other items remain correctly tracked. Build green.
