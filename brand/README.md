# Carbon Capture: Climate Overseer — Brand Package v1.0

Final, build-ready brand for **Carbon Capture: Climate Overseer** — the founder-approved
**Option 2 "Carbon Lockup"** (from CAR-21). Hex molecular lattice + downward arrow:
carbon captured and locked away. Personality: **industrial · technical · decisive.**

Visual one-pager: **`brand-sheet.png`** (source: `brand-sheet.html`).

---

## Palette

| Token | Hex | Use |
|-------|-----|-----|
| **Capture Green** | `#36E27B` | Primary brand colour — mark, accents, CTAs |
| Green Bright | `#5CF59B` | Hover / glow / highlight |
| Green Deep | `#0C8F47` | Shadow, and the mark when placed on light backgrounds |
| **Carbon** | `#14171C` | Canvas background |
| Ink | `#0E1014` | Deepest background / app-icon base |
| Panel | `#1B1F26` | Raised surfaces, cards, icon tile |
| Line | `#2A2F38` | Hairlines, the honeycomb lattice |
| White | `#F2F5F4` | Primary text on dark |
| Muted | `#8A93A0` | Secondary text |

## Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / wordmark line 1 | **Oswald** | 700 | Condensed. Headings, "CLIMATE". |
| Display light / wordmark line 2 | **Oswald** | 300 | "OVERSEER", letter-spacing 6–8. |
| Eyebrow / UI mono | **Space Mono** | 700 | Uppercase, letter-spacing 4–6. Labels, HUD, data, "CARBON · CAPTURE". |

Both are Google Fonts. Bundled **offline** (no external request) in **`fonts.css`** as
base64 `@font-face`. Either `@import "/brand/fonts.css";` or use the standard CDN link:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

---

## File index

### Logo system — `logo/`
SVGs are the source of truth (mark is pure vector, no font dependency). `@2x.png` are
2× raster fallbacks (fonts embedded in the SVG, so SVGs render correctly anywhere too).

| File | What |
|------|------|
| `mark.svg` | Mark only (green hex + arrow), transparent background |
| `mark-dark.svg` / `mark-light.svg` | Mark on a carbon / white tile |
| `horizontal-dark.svg` · `…light.svg` | Horizontal lockup (mark + wordmark) |
| `stacked-dark.svg` · `…light.svg` | Stacked lockup (mark over wordmark) |
| `*@2x.png` | 2× raster of each of the above |

### App icon + favicons — `icon/`
| File | What |
|------|------|
| `app-icon.svg` | Master app-icon (rounded tile, gradient, green mark) |
| `app-icon-{1024,512,256,192,180,128,64,48,32,16}.png` | Exported sizes |
| `favicon.ico` | Multi-resolution ICO (16/32/48/64/128/256) |
| `favicon.svg` | Scalable favicon |
| `apple-touch-icon.png` | 180×180, flattened |
| `site.webmanifest` | PWA manifest (theme `#14171C`) |
| `head-snippet.html` | Exact `<head>` tags to wire it all in |

---

## Engineer handoff (CAR-23)

The consumable favicon/icon set is **already copied to `public/`** (Vite serves it at site
root `/`):

```
public/favicon.ico  public/favicon.svg  public/apple-touch-icon.png
public/icon-16.png  public/icon-32.png  public/icon-192.png  public/icon-512.png
public/site.webmanifest
```

1. Paste `icon/head-snippet.html` into the `<head>` of **`index.html`** and **`game.html`**.
2. For in-game logo use, reference `brand/logo/horizontal-dark.svg` (or the `@2x.png`).
3. Load the fonts via `brand/fonts.css` (offline) or the Google Fonts link above, then use
   `font-family:'Oswald'` for display and `font-family:'Space Mono'` for labels/HUD.

## Reproducing / regenerating

```bash
node brand/build-brand.mjs     # regenerates every SVG + PNG + fonts.css
python3 brand/build-favicon.py # rebuilds favicon.ico + apple-touch-icon from the PNGs
```

`build-brand.mjs` is the single source of truth for all geometry, colour and type.
