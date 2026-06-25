# Design / UX audit — CAR-127 (Quality Loop)

**Date:** 2026-06-25 · **Auditor:** Designer · **Build:** `main` @ 7419850
**Product:** Carbon Capture: Climate Overseer (vanilla JS / Vite browser game)
**Brand ref:** `brand/README.md` (Carbon `#14171C` canvas, Capture Green `#36E27B`, Oswald + Space Mono)

Scope: accessibility (labels, keyboard operability, contrast), error/empty/loading
states, dead/misleading affordances, copy quality, off-brand styling. Every fix below
is small and reversible (mostly attribute additions and copy edits).

## Already tracked — NOT re-filed
- **App theme is fully off-brand** (gold `#f0c66f` on blue Palatino/Trebuchet serif vs.
  green-on-carbon Oswald/Space Mono; `brand/fonts.css` imported nowhere). Tracked as
  **CAR-49** (high). This audit deliberately excludes all theme/colour/font-family items.
- Prior a11y wins, verified still present: header chips keyboard-operable (CAR-50),
  map-mode `aria-label` (CAR-51), non-colour valence cues on events (CAR-52),
  focus ring on selects/search (CAR-84). Not re-reported.

## Prioritized findings

### F1 — Popups/modals have no dialog semantics; close buttons unlabelled (HIGH, a11y)
All overlay popups are plain `<div class="popup-container">` with **zero**
`role="dialog"` / `aria-modal` in the entire app (`grep` count: 0 in game.html + game.js).
The `&times;` close buttons have no accessible name.
- Evidence: `game.html:448–455` (Carbon Balance), `:502`, `:555`; `game.js:12612`
  (assignment modal). e.g. `<button class="popup-close" onclick="…">&times;</button>`.
- Impact: screen-reader users get no "dialog" boundary, no labelled close control;
  focus is not trapped or returned.
- Fix: add `role="dialog" aria-modal="true" aria-labelledby="<title-id>"` to each dialog,
  `aria-label="Close"` to each close button. (Focus-trap/Esc is a nice follow-up.)
→ **fix-issue filed.**

### F2 — Dynamic game feedback is silent to assistive tech (HIGH, a11y)
The news/briefing log and achievement toasts update the DOM with no live region, so
disasters, tipping points, and unlocks are never announced.
- Evidence: `#news-log` div `game.html:362` has no `aria-live`/`role="log"`;
  `pushMessage()` `game.js:~14990`; achievement toast `game.js:3769` (`.achievement-toast`,
  no `role="status"`/`aria-live`).
- Fix: `aria-live="polite" role="log"` on `#news-log`; `role="status" aria-live="assertive"`
  on the toast element.
→ **fix-issue filed.**

### F3 — Range sliders have no programmatic label (MED, a11y)
Carbon-tax negotiation sliders show their name in a sibling `<span>` only; the
`<input type="range">` itself has no `aria-label`/`aria-labelledby`.
- Evidence: `game.js:9048` (Tax Rate), `:9065` (Yearly Growth), `:9579`.
- Fix: add `aria-label="Carbon tax rate ($/ton)"` etc. (or `aria-labelledby` the header span).
→ **fix-issue filed.**

### F4 — Clickable meter/stat rows are mouse-only (MED, a11y)
Several interactive rows are `<div onclick=…>` with no `role`/`tabindex`/keydown, so
keyboard users cannot open the breakdown popups they trigger.
- Evidence: `game.js:10186` (happiness row → happiness popup), `:10212` (carbon-tax row),
  interest meter rows nearby. All `<div … onclick="…" title="Click …">`.
- Fix: convert to `<button>` (preferred) or add `role="button" tabindex="0"` + Enter/Space
  keydown handler.
→ **fix-issue filed.**

### F5 — Empty-state copy is inconsistent; news log has no empty placeholder (LOW/MED, copy)
Empty states use four different phrasings ("No allied regions yet", "Nothing under
construction", "No projects built yet", "No active disasters"), and `clearNews()`
(`game.js:15020`, `newsLogEl.innerHTML = ""`) leaves a blank panel with no
"No events yet" hint.
- Fix: standardise on "No <items> yet." and render a muted placeholder when `#news-log`
  is empty.
→ **fix-issue filed.**

## Notes / not filed
- Section-info `ⓘ` buttons already carry `aria-label` (good) — only their small visual
  size is a concern, which the CAR-49 theme work will address.
- `<details>`-wrapped graph tabs (`game.html:365–389`) are unconventional but operable;
  left as-is.
