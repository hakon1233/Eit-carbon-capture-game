# Design / UX audit — CAR-234 (Quality Loop)

**Date:** 2026-06-26 · **Auditor:** Designer · **Build:** `main` @ 16b9136
**Product:** Carbon Capture: Climate Overseer (vanilla JS / Vite browser game)
**Brand ref:** `brand/README.md` (Carbon `#14171C` canvas, Capture Green `#36E27B`, Oswald + Space Mono)

Scope: accessibility (labels, keyboard operability, contrast), error/empty/loading
states, dead or misleading affordances, copy quality, off-brand styling. Every fix
below is small and reversible (markup / `<head>` only).

## Context — this is the 5th pass; the surface is saturated and healthy

Prior Design/UX passes **CAR-127 / CAR-150 / CAR-190 / CAR-206** already filed the
obvious a11y / copy / empty-state / brand items. I re-verified these as still-tracked
and **deliberately did NOT re-file** (open backlog): CAR-49 (off-brand theme: colours,
Oswald/Space Mono fonts still not loaded, contrast), CAR-66 (dead CSS prune),
CAR-71 (aria-labels for icon-only buttons incl. the `?` stats toggle, `game.html:200`),
CAR-101 (`game.html` missing `<main>` + `<h1>`), CAR-102 / CAR-199 (win/deadline copy),
CAR-104 / CAR-105 / CAR-139 / CAR-142 / CAR-143 / CAR-144 (tutorial offer, dead/empty
states, achievement progress, glossary, save-load failure notice), CAR-137 / CAR-138
(slider SR labels, keyboard meter rows), CAR-159 (`<noscript>` fallback), CAR-186 /
CAR-187 / CAR-200 / CAR-201 / CAR-202 / CAR-203 (autosave indicator, exit confirm,
advance-year feedback, HUD difficulty cue, skip-tutorial copy, region-granularity
caption), CAR-197 (range-slider focus ring), CAR-213 / CAR-214 / CAR-215 / CAR-228 /
CAR-229 / CAR-230 (log history, end-run achievements, slider reset, false "tracked
across sessions" copy, first-decision help placement, 39 undefined CSS vars).

**Re-verified fixed since last pass (not re-reported):**
- **CAR-216 (reference-page back-links)** — `Game_Data_Reference.html` and
  `Emissions_Data_Reference.html` now both ship `← Back to Menu` links (`grep -c` = 3
  each), matching `game_rules.html`. The CAR-206 dead-end is resolved.

**Re-verified good (not re-reported):** `index.html` ships a clean launch screen (real
`<h1>`, `<label for="difficulty">`, CSP, `theme-color`, full favicon/manifest head,
`aria-live` difficulty details); `game.html` has dialog semantics, `aria-live` news log,
labelled selects, titled header chips, a real `disabled` attribute on gated buttons,
and a `Reload map` error-state affordance (`game.html:191`); **`prefers-reduced-motion`
is fully handled** by a global wildcard reset (`style.css:9307`, WCAG 2.3.3 / CAR-99)
despite ~140 transitions/animations; all four reference pages have `lang`, `viewport`,
`<title>`. No `coming soon`/`TODO`/placeholder copy ships in `game.js` ("Under
Construction" is a real in-game project state, not a stub).

Because that surface is saturated, this pass drills into the **document `<head>` /
share-preview surface** and the **launch-screen image semantics** that prior passes did
not cover.

## Prioritized findings

### F1 — No share/SEO metadata: link previews are blank (MEDIUM, copy · off-brand · discoverability)
Neither `index.html` nor `game.html` carries a `<meta name="description">`, and there
are **zero** Open Graph / Twitter-card tags (`grep -c 'og:|meta name="description"'` = 0
on both). This is a shareable school-demo web game: when the URL is pasted into a chat,
an LMS, or social, the unfurl shows only the bare `<title>` with **no description and no
image** — an off-brand first impression for a product that already ships polished logo
art (`brand/logo/horizontal-dark@2x.png`, `brand/brand-sheet.png`).

- **Why it's new:** no open issue covers page metadata / share previews; prior passes
  audited body markup, not the `<head>` description/OG surface.
- **Fix (small, reversible — `<head>` only):** add a one-line
  `<meta name="description" content="…">` (reuse the launch subtitle copy:
  *"Steer the planet away from warming by investing in carbon solutions."*) plus
  `og:title` / `og:description` / `og:image` (point at an existing brand PNG) and the
  `twitter:card` equivalents to `index.html`; add the `description` to `game.html`. CSP
  already allows same-origin images, so the brand asset works without policy changes.
- → **fix-issue filed (CAR-241).**

### F2 — Launch-screen logo alt duplicates the `<h1>`, double-announced to screen readers (LOW, a11y)
On the launch screen the brand logo image carries
`alt="Carbon Capture: Climate Overseer"` (`index.html:30`) and is immediately followed
by an `<h1>` with the **identical** text (`index.html:34`). A screen reader therefore
announces the product name twice in a row. The logo is decorative here because the `<h1>`
already provides the accessible name.

- **Why it's new:** prior passes confirmed the `<h1>` exists but did not flag the
  duplicate accessible name introduced by the logo `alt`.
- **Fix (small, reversible — one attribute):** set the logo `alt=""` (mark it decorative)
  so the `<h1>` is the single source of the page's accessible name. No layout change.
- → **fix-issue filed (CAR-242).**

## Notes / not filed
- **`index.html` also lacks a `<main>` landmark** (it uses `<div id="launch-screen">`).
  This is the same landmark gap CAR-101 already tracks for `game.html`; folding both
  pages into CAR-101 is cleaner than a separate file — **noted for whoever picks up
  CAR-101** (apply the `<main>` wrapper to `index.html` too).
- Launch-screen `.doc-icon` / launch-card emoji remain decorative but not `aria-hidden`
  (SR reads "bar-chart Game Data Reference"). Cosmetic; same low-priority disposition as
  CAR-206 — not worth a fix-issue alone.
- Brand **Oswald / Space Mono** fonts are still not loaded (`grep` of `index.html` /
  `game.html` / `style.css` finds neither `@font-face` nor a fonts link). This remains
  squarely inside **CAR-49** (off-brand theme) — not re-filed.
