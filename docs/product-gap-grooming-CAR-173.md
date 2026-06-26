---
name: product-gap-grooming-CAR-173
description: PM product-gap & backlog grooming pass (CAR-173) — prioritized findings for the climate game's core user journeys, with dedup notes against the existing backlog.
type: reference
last_reviewed: 2026-06-26
---

# Product Gap & Backlog Grooming Pass — CAR-173

PM quality-loop pass. Reviewed the climate-strategy game against its core user
journey (launch / Continue → setup & difficulty → play: place projects, adjust
carbon-tax sliders, advance months, react to events → win/lose → exit/restart →
resume). Cross-checked the open backlog (71 open issues) so this does **not**
re-file tracked work.

## Method

- Mapped the journey from `index.html` (launch/menu) and `game.html` (play
  screen), tracing the autosave/continue path through `game.js`.
- Diffed candidate gaps against every open issue. The backlog is already
  **heavily groomed** for product gaps — end-game summary (CAR-161/103),
  win-condition surfacing (CAR-162/141), tutorial-on-any-difficulty (CAR-104),
  glossary/tooltips (CAR-143), silent empty/dead states incl. "can't afford"
  (CAR-105), world-map load fallback (CAR-100), saved-game load-failure notice
  (CAR-144), Continue-shows-which-save (CAR-165), difficulty details on launch
  (CAR-163), export/import (CAR-164) are all already filed. Large systems
  (project upgrades, random events, achievements) are tracked in
  `docs/TODO.md` / `docs/NICE-TO-HAVE.md`.
- Only genuinely-new, small, reversible gaps are filed below.

## Findings (prioritized)

### F1 — Player is never told the game autosaved ("save confidence") · P1 · S
**Evidence:** `game.js:6650` `function saveGame()`, invoked from 7 sites
(`game.js:2528, 2568, 2658, 8401, 11029, 12601` + the explicit save) on
construction, tech unlock, month tick, alliance/campaign changes. None of these
produce any on-screen feedback — grep for a "Saved"/"Saving" indicator returns
nothing in the play UI.

**Gap / impact:** The game silently autosaves to `localStorage`, and
`index.html` Continue (`index.html:65`, gated on `SAVE_KEY` at lines 103–116)
faithfully restores it — but the player has **no signal** that any of this
happened. They cannot tell whether closing the tab or hitting Exit is safe, so
the autosave system's main benefit (peace of mind) is invisible.

**Proposed fix:** A small, debounced "✓ Saved" indicator that appears briefly
in the header after `saveGame()` resolves. No change to save logic. → **filed as a new issue.**

### F2 — Exit has no confirm/reassurance, unlike Restart right beside it · P2 · XS
**Evidence:** `game.html:171–172` — `#restart-button` and a bare
`<a href="index.html">Exit</a>` sit side by side. Restart guards with a
confirm dialog (`game.js:15494`: *"Restart the game? Your current progress will
be lost."*); Exit has **no** handler and no microcopy.

**Gap / impact:** A mis-click on Exit yanks the player to the menu mid-run. The
run is in fact recoverable via Continue (autosave persists), but nothing tells
the player that — so Exit reads as a destructive dead-drop. The inconsistency
with the adjacent, guarded Restart is the tell.

**Proposed fix:** Either a lightweight confirm on Exit, or (preferred, cheaper,
and synergistic with F1) microcopy/tooltip stating progress is auto-saved and
resumable via Continue. → **filed as a new issue, cross-linked to F1.**

## Considered but NOT filed (dedup / low-signal)

- Disabled "can't afford" project buttons lacking an explanatory tooltip →
  **covered by CAR-105** (actionable prompts incl. can't-afford).
- Saved-game load failure shows no error → **covered by CAR-144.**
- Continue button doesn't show difficulty/date → **covered by CAR-165.**
- World-map SVG load has no error state → **covered by CAR-100.**
- Carbon-tax slider "no feedback" → **rejected:** `updateCarbonTaxRate()`
  (`game.js:9005–9044`) already updates rate, revenue, warning color, and the
  region panel live; the live display *is* the feedback.

## Disposition

Two new, small, reversible issues filed (F1, F2). Backlog confirmed
well-groomed; no other genuinely-new product gap rose above the noise floor
this pass.
