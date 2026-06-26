# Design / UX audit — CAR-190 (Quality Loop)

**Date:** 2026-06-26 · **Auditor:** Designer · **Build:** `main` @ 2588819
**Product:** Carbon Capture: Climate Overseer (vanilla JS / Vite browser game)
**Brand ref:** `brand/README.md` (Carbon `#14171C` canvas, Capture Green `#36E27B`, Oswald + Space Mono)

Scope: accessibility (labels, keyboard operability, contrast), error/empty/loading
states, dead/misleading affordances, copy quality, off-brand styling. Every fix below
is small and reversible (CSS only).

## Context — three prior passes already cover most of the surface

This is the third Design/UX pass in the quality cycle (after **CAR-127** and **CAR-150**).
The obvious a11y / copy / empty-state / brand surface is already tracked by open issues,
which I re-verified and **deliberately did NOT re-file**:

- **CAR-49** — app theme off-brand (all colour / font-family / contrast items live here).
- **CAR-71** — aria-labels for icon-only buttons (× close, `?` stats toggle).
- **CAR-100 / CAR-144** — silent map / save-load failure states.
- **CAR-101** — missing `<main>` landmark and `<h1>` in `game.html` (confirmed still absent:
  `grep -c "<main"` = 0, `grep -c "<h1"` = 0 in `game.html`).
- **CAR-102** — contradictory win-deadline copy.
- **CAR-104 / CAR-105 / CAR-139–143** — tutorial offer, dead/empty states, copy.
- **CAR-135–138** — dialog semantics, aria-live regions, slider **aria-labels**,
  keyboard-operable meter rows.
- **CAR-158** — `prefers-reduced-motion` support.
- **CAR-159** — `<noscript>` fallback.

Verified-good and not re-reported: `index.html` `#difficulty` select has a real
`<label for>` (`index.html:54`); `#map-mode` select is `aria-label`led (`game.html:149`);
native `<select>` + search controls have a correct shared `:focus-visible` ring
(`style.css:1515–1520`); the in-game topbar brand link takes its accessible name from the
logo `alt`; `game.html` ships static markup (not a blank-until-JS shell), so no separate
loading-state gap. `html lang`, `<title>`, viewport and theme-color are all present.

Because that surface is saturated, this pass drills into one dimension no open issue covers.

## Prioritized findings

### F1 — Range sliders have no visible keyboard focus indicator (HIGH, a11y · WCAG 2.4.7 AA)
Two interactive `<input type="range">` controls set `outline: none` but define **only
`:hover`** thumb styling — no `:focus` / `:focus-visible` rule. A keyboard user can change
the value with arrow keys but gets **no visible indication of which slider is focused**.
These are core gameplay controls (alliance-negotiation **term sliders** and the
**carbon-tax policy** panel), so the gap sits on the diplomacy/policy flow, not a corner.

- **Evidence (`style.css`):**
  - `.term-slider { … outline: none; }` at `style.css:6219–6228`; thumbs at `:6237` /
    `:6260`, only `:hover` variants (`:6249`). Used at `game.js:9713`, `:9721`.
  - `.carbon-tax-control input[type="range"] { … outline: none; }` at `style.css:8652–8659`;
    thumbs at `:8661` / `:8677`, only `:hover` (`:8672`, `:8687`).
- **Why it's new:** distinct from **CAR-137**, which adds *aria-labels* (screen-reader
  name) to the same sliders. This is the *visible* focus indicator — a different WCAG SC
  and a different user. The sibling `<select>`/search controls already do this correctly
  (`style.css:1515–1520`); the sliders were simply missed.
- **Fix (small, reversible — CSS only, no markup change):** add a brand-accent
  `:focus-visible` ring on the thumbs, mirroring the existing pattern:
  ```css
  .term-slider:focus-visible::-webkit-slider-thumb,
  .carbon-tax-control input[type="range"]:focus-visible::-webkit-slider-thumb {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .term-slider:focus-visible::-moz-range-thumb,
  .carbon-tax-control input[type="range"]:focus-visible::-moz-range-thumb {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  ```
  (`box-shadow: 0 0 0 2px var(--accent)` on the thumb is a more universally-supported
  fallback if pseudo-element `outline` misbehaves in a target browser.)
- → **fix-issue filed (CAR-197).**

## Notes / not filed
- `.region-search-input` is styled (`style.css:1287–1296`) but I found **no markup that
  uses the class** (no match in `game.html` / `game.js`) — likely dead CSS. Cosmetic;
  left for a future tidy, not worth a fix-issue on its own.
- 12 `title=` attributes remain in `game.html`; the load-bearing ones also carry visible
  text or fall under CAR-71's icon-button labelling. No control relies on `title` as its
  *sole* affordance, so not filed (same disposition as CAR-150).
- Muted text token `#8A93A0` on Carbon/Panel passes WCAG AA; real contrast risk lives in
  the current off-brand theme that **CAR-49** replaces wholesale — not audited here.
