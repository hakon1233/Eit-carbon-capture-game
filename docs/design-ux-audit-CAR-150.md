# Design / UX audit — CAR-150 (Quality Loop)

**Date:** 2026-06-25 · **Auditor:** Designer · **Build:** `main` @ a0e8576
**Product:** Carbon Capture: Climate Overseer (vanilla JS / Vite browser game)
**Brand ref:** `brand/README.md` (Carbon `#14171C` canvas, Capture Green `#36E27B`, Oswald + Space Mono)

Scope: accessibility (labels, keyboard operability, contrast), error/empty/loading
states, dead/misleading affordances, copy quality, off-brand styling. Every fix below
is small and reversible (a CSS media query and an HTML block).

## Context — coverage is already deep; this pass adds only genuinely new gaps

The previous same-cycle audit (**CAR-127**) and the QA/PM passes have already filed a
broad backlog. I verified these are open and **deliberately did NOT re-file** them:

- **CAR-49** — app theme off-brand (colours + load Oswald/Space Mono). All
  colour/font-family/contrast items belong here; excluded from this audit.
- **CAR-71** — aria-labels for icon-only buttons (× close ×3, `?` stats toggle).
- **CAR-100** — world-map SVG has no error/fallback state.
- **CAR-101** — no `<main>` landmark and no `<h1>` (heading hierarchy starts at h2).
- **CAR-102** — contradictory win-deadline copy (2050 vs 2100).
- **CAR-103** — end-game results modal (win/defeat summary + Play Again).
- **CAR-104** — offer tutorial to all first-time players.
- **CAR-105 / CAR-139** — silent dead/empty states + empty-state copy.
- **CAR-135–138** — dialog semantics, aria-live regions, slider labels, keyboard-operable
  meter rows (CAR-127 F1–F4).
- **CAR-140** — stray "Continue" button on launch.
- **CAR-141–144** — persistent objective cue, achievement progress, glossary/tooltips,
  save-load failure notice.

Because the obvious a11y/copy/empty-state surface is already tracked, this audit drills
into two dimensions **not** covered by any open issue.

## Prioritized findings

### F1 — No `prefers-reduced-motion` support anywhere (HIGH, a11y · WCAG 2.3.3 / 2.2.2)
The stylesheet defines **24 `@keyframes` and 139 animation/transition rules** with
**zero** `prefers-reduced-motion` media query (`grep -c` = 0 in `style.css`,
`game.html`, `game.js`; no `matchMedia` in `game.js`). Several are **persistent,
always-visible HUD elements that animate infinitely** and a motion-sensitive user
cannot escape:
- `.temp-gauge.in-danger` → `animation: pulse-danger 2s infinite` (`style.css:557`)
- `.co2-bar.in-danger` → `animation: pulse-danger 2s infinite` (`style.css:561`)
- `criticalPulse 1s infinite` (`style.css:5126`), `spotlightPulse 2s infinite`
  (`style.css:8598`), plus `achievementBounce`, `negotiating-pulse`, tutorial pulses.
- **Impact:** continuously pulsing/bouncing UI can trigger vestibular discomfort,
  nausea, and migraine; the danger pulses sit on the primary temperature/CO₂ readouts,
  so they are unavoidable during the most stressful moments of play. Also brushes
  WCAG 2.2.2 (motion that runs >5s with no pause/stop).
- **Fix (small, reversible):** add one block at the end of `style.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  Preserves end states, kills looping motion, no markup change.
→ **fix-issue filed (CAR-158).**

### F2 — No `<noscript>` fallback; JS-off / load-failure shows a blank page (MED, error-state)
Both `index.html` and `game.html` are JS-driven SPAs with **no `<noscript>`** block
(`grep -c noscript` = 0 in both). If JavaScript is disabled, blocked, or the main
bundle fails to load, the visitor sees an empty dark page with **no explanation** —
the same silent-failure class the QA pass flagged for the map (CAR-100) and saves
(CAR-144), but for the whole app.
- **Evidence:** `game.html:23` `<body class="in-game">` and `index.html:23` `<body>`
  contain only script-populated containers; no `<noscript>`.
- **Fix (small, reversible):** add a brand-styled `<noscript>` notice right after
  `<body>` in both files, e.g. *"This game needs JavaScript. Please enable it (or try a
  different browser) to play Carbon Capture: Climate Overseer."* Inline styles keep it
  CSP-safe and independent of the stylesheet load.
→ **fix-issue filed (CAR-159).**

## Notes / not filed
- `title`-only affordances: 12 `title=` attributes in `game.html`. The important ones
  (finance chips, map controls) also carry visible text or live under CAR-71's
  icon-button labelling, so not separately filed. Worth a future sweep if `title` is
  ever the *sole* affordance on a control.
- Muted text token `#8A93A0` on Carbon `#14171C` ≈ 5.5:1 and on Panel `#1B1F26` ≈ 5.1:1
  — both pass WCAG AA for normal text. Real contrast risk lives in the *current*
  off-brand theme, which CAR-49 replaces wholesale; not audited here.
- `<object id="map-object" aria-label="World map">` is labelled; deeper keyboard
  operability of individual map regions is a larger piece, left for a dedicated issue
  if it surfaces in live QA.
