# Performance & Bundle-Size Pass — CAR-130

_Repo Maintainer recurring quality pass. Date: 2026-06-25. Measured against `vite build`
(v5.4.21). Fifth pass in this series; read [CAR-59](./perf-bundle-pass-CAR-59.md) (the
substantive pass), [CAR-80](./perf-bundle-pass-CAR-80.md),
[CAR-95](./perf-bundle-pass-CAR-95.md), and
[CAR-113](./perf-bundle-pass-CAR-113.md) first._

## TL;DR

This pass landed one **new, clearly-safe, lossless** win the prior four passes never
inspected: the site-wide `favicon.ico` was **30,155 B** packing six embedded PNGs
(16/32/48/64/128/256). Browsers only ever use 16/32/48 from an `.ico`; every large-icon
surface (PWA install, apple-touch, Open Graph) is already served by the dedicated
`icon-192/512.png` + `apple-touch-icon.png` + `site.webmanifest`. Repacked the `.ico` to
**4,689 B** (−25.4 KB, **−84%**) by copying the existing 16/32/48 PNG payloads
**byte-for-byte** into a slimmer container — no re-encoding, no tooling, pixel-identical at
every size a browser actually renders. `favicon.ico` is `<link>`ed on **every** page, so
this trims cold-load weight across the whole site. Build green; everything else that moves
the needle remains correctly tracked and was re-verified, not re-filed.

## How this was measured

`npx vite build` → `dist/` report (raw + gzip); per-asset `find … | ls`; ICO directory
parsed with a small Python script (header + 16-byte entries) to enumerate embedded
sub-images by size/format; import-graph + `<link>` grep to confirm which icon assets each
surface actually consumes. Tooling probe: `svgo` still **not installable offline** (`npx`
cannot fetch `svgo@4.0.1`), so **CAR-106** (map SVG precision reduction) remains genuinely
blocked here; no ICO tooling present either, which is why the lossless byte-copy repack
(rather than re-encoding) was the correct approach.

## Current build snapshot (game screen)

| Asset (game screen) | raw | gzip | Notes |
| --- | --- | --- | --- |
| `assets/maps/mapsvg-world-world.svg` | 1.24 MB | **394 KB** | largest runtime asset — tracked **CAR-106** (needs svgo, still blocked) |
| `game.js` | 341.88 kB | 92.44 kB | monolith — extraction tracked **CAR-69** |
| `style.css` | 123.82 kB | 21.26 kB | dead-rule pruning tracked **CAR-66** |
| `favicon.ico` (every page) | 30.15 → **4.69 kB** | — | ✅ FIXED this pass (lossless repack) |
| `horizontal-dark.svg` (launch logo) | 19.84 kB | 9.71 kB | ✅ subset in CAR-95 |

## Findings

### 1. ✅ FIXED — `favicon.ico` 30.15 KB → 4.69 KB (lossless, −84%)

The `.ico` is referenced on every page via `<link rel="icon" href="favicon.ico"
sizes="any">` (game.html:14, and the analogous head in the other pages). It embedded six
PNG sub-images:

| size | bytes | used by a browser favicon? |
| --- | --- | --- |
| 16×16 | 636 | ✅ tab |
| 32×32 | 1540 | ✅ tab / hi-DPI |
| 48×48 | 2459 | ✅ Windows taskbar |
| 64×64 | 3293 | ✗ |
| 128×128 | 7119 | ✗ |
| 256×256 | 15006 | ✗ |

The 64/128/256 entries (~25 KB, 84% of the file) are dead weight: no favicon context
requests them, and every large-icon surface is already served by dedicated assets
(`icon-192.png`, `icon-512.png` via `site.webmanifest`; `apple-touch-icon.png` at 180×180;
`favicon.svg` for scalable). 

**Fix applied:** parsed the ICO directory and rewrote it keeping only the 16/32/48 entries,
copying their **exact existing PNG byte payloads** into a freshly built header/directory
(pure container repack — no pixel re-encoding). The three retained sub-images are
byte-identical to the originals (verified by SHA-256), so the rendered favicon is
pixel-identical at every size a browser shows. New file re-parses as a valid 3-entry ICO
with all PNG payloads in-bounds; `vite build` copies it to `dist/favicon.ico` (4,689 B) and
stays green.

**Why it's safe / reversible:** lossless (retained payloads unchanged), no observable UI
change on any surface, single tracked binary file fully recoverable via `git revert`.

### 2. OPEN (already tracked, NOT re-filed)

- **`mapsvg-world-world.svg` — 1.24 MB / 394 KB gzip**, single largest game-screen asset.
  Tracked **CAR-106** (svgo `convertPathData`/`cleanupNumericValues`). Still blocked: svgo
  not installable offline this pass. The remaining win is coordinate-precision reduction —
  svgo's job, and not a clearly-safe hand edit (risks visibly shifting borders). The file is
  loaded via a static `<object>` in `game.html` (line 163), so it is fetched in parallel
  during HTML parse — **no waterfall** to fix.
- **`style.css` 124 KB (21 KB gz)** dead-rule pruning. Tracked **CAR-66** (backlog, low).
- **`game.js` ~15.7k-line monolith** incremental extraction. Tracked **CAR-69** (backlog,
  low).

## Not a problem (re-confirmed)

- **Runtime hot paths / re-renders:** turn-based. `game.js` has **no** `setInterval` and no
  per-frame rAF/animation loop; `innerHTML`/`setTimeout` writes fire on discrete user
  actions (`nextMonth()`, clicks), not per frame. No N² rebuild.
- **Network:** static single-page build; no N+1/waterfall fetches; data is bundled into
  `game.js`. Map SVG loads in parallel via `<object>` (see above).
- **`icon-512.png` (33 KB)** is the PWA maskable icon, fetched only on install via the
  manifest — not on page load. Acceptable; left as-is.
- **Large reference HTMLs** (`game_mechanics.html` 150 KB, etc.) are separate linked pages,
  not loaded on the game screen.

## Net result of this pass

One new clearly-safe, reversible, lossless change landed: **`favicon.ico` 30.15 → 4.69 KB
(−25.4 KB / −84%)**, trimming cold-load weight on every page with zero pixel change. The
needle-moving items (map SVG / dead CSS / monolith extraction) remain correctly tracked and
open; nothing re-filed. Build green.
