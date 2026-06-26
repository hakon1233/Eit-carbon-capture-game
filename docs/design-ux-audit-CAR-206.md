# Design / UX audit — CAR-206 (Quality Loop)

**Date:** 2026-06-26 · **Auditor:** Designer · **Build:** `main` @ d7c7200
**Product:** Carbon Capture: Climate Overseer (vanilla JS / Vite browser game)
**Brand ref:** `brand/README.md` (Carbon `#14171C` canvas, Capture Green `#36E27B`, Oswald + Space Mono)

Scope: accessibility (labels, keyboard operability, contrast), error/empty/loading
states, dead or misleading affordances, copy quality, off-brand styling. Every fix
below is small and reversible (markup only).

## Context — this is the 4th pass; the surface is saturated

Prior Design/UX passes **CAR-127 / CAR-150 / CAR-190** already filed the obvious
a11y / copy / empty-state / brand items, which I re-verified as still-tracked and
**deliberately did NOT re-file**:

- **CAR-49** (todo) — app theme off-brand (all colour / font-family / contrast items).
- **CAR-71** (backlog) — aria-labels for icon-only buttons.
- **CAR-101** (backlog) — missing `<main>` landmark + `<h1>` in `game.html`.
- **CAR-102 / CAR-199** (backlog) — win/deadline copy.
- **CAR-104 / CAR-105 / CAR-139 / CAR-142 / CAR-143 / CAR-144** (backlog) — tutorial
  offer, dead/empty states, achievement progress, glossary, save-load failure notice.
- **CAR-137 / CAR-138** (backlog) — slider screen-reader labels, keyboard-operable meter rows.
- **CAR-159** (backlog) — `<noscript>` fallback.
- **CAR-186 / CAR-187 / CAR-200 / CAR-201 / CAR-202 / CAR-203** (backlog) — autosave
  indicator, exit confirm, advance-year feedback, HUD difficulty cue, skip-tutorial copy,
  region-granularity caption.
- **CAR-197** (backlog) — range-slider visible focus ring (filed by CAR-190; re-confirmed
  the two `outline: none` sliders at `style.css:6401` `.term-slider` and `:8833`
  `.carbon-tax-control input[type="range"]` still lack a `:focus-visible` rule).

Re-verified good (not re-reported): `index.html` ships a clean launch screen — real
`<h1>`, `<label for="difficulty">`, CSP, theme-color, favicons, `aria-live` difficulty
details; `game.html` has dialog semantics, `aria-live` news log, labelled selects and
header chips; disabled buttons use the real `disabled` attribute (`game.js:13568`,
`:14281`, `:14439`, `:15281`); only the 3 selects/search + 2 sliders carry `outline: none`
and the selects/search already have a correct `:focus-visible` ring (`style.css:1607–1613`).

Because that surface is saturated, this pass drills into the **documentation-link surface**
that prior passes did not cover.

## Prioritized findings

### F1 — Two launch-screen reference pages are navigation dead-ends (MEDIUM, ux · dead affordance)
The launch screen's "Documentation" grid (`index.html:80–104`) links to four reference
pages **in the same tab**. Two of them have **no link back to the menu/game**, so a
player who opens them is stranded with only the browser Back button:

- `Game_Data_Reference.html` — has an internal `<nav class="sidebar">` TOC (`:305`) but
  **zero** links to `index.html`/`game.html` (`grep -c "Back to Menu|back-link"` = 0).
- `Emissions_Data_Reference.html` — no nav and **zero** back links at all.

This is an inconsistency, not a universal gap: the sibling pages **`game_rules.html`**
and **`game_mechanics.html`** both ship a `← Back to Menu` link at top and bottom
(`game_rules.html:13`, `:1588`, class `.back-link` / `.primary-button`).

- **Why it's new:** no open issue covers the reference-doc pages; prior passes audited
  `index.html` / `game.html` only.
- **Fix (small, reversible — markup only):** add the same top-of-page
  `<a href="index.html" class="back-link">&larr; Back to Menu</a>` to both pages, mirroring
  `game_rules.html`. `.back-link` is already styled in `style.css`, so no new CSS.
- → **fix-issue filed (CAR-216).**

## Notes / not filed
- **Skip-to-content link** is absent in `game.html` (keyboard users tab through the full
  topbar before reaching the board). This is dependent on **CAR-101** landing a `<main>`
  landmark to target, so it belongs there rather than as a separate file — noted for
  whoever picks up CAR-101.
- Launch-screen `.doc-icon` emoji (📖 ⚙️ 📊 🌍, `index.html:81`…) are decorative but not
  `aria-hidden`, so screen readers announce e.g. "bar-chart Game Data Reference". Cosmetic;
  same low-priority disposition as prior passes' minor notes — not worth a fix-issue alone.
- `.region-search-input` CSS (`style.css`) remains with no markup using it (dead CSS, also
  noted in CAR-190); tracked-adjacent under the CAR-66 dead-CSS prune.
