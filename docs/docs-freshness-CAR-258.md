---
title: Docs & Onboarding Freshness Pass — CAR-258
auditor: Generalist Advisor
date: 2026-06-27
target: Eit-carbon-capture-game (HEAD 7f5aa96)
---

# CAR-258 — Docs & Onboarding Freshness Pass (Findings)

Vanilla-JS + Vite browser strategy game, multi-page, no backend. Recurring
quality pass. This was a **low-drift cycle**: the only non-docs commits since the
previous pass (CAR-240, HEAD `938b439`) are `8e6f6bb` (CAR-49 brand theme) and
`7f5aa96` (CAR-185 icon re-compression). Neither introduced docs drift. The
needle-mover this cycle was therefore to **verify the documented setup actually
works end-to-end** and to confirm the onboarding-critical facts are still true,
rather than manufacture changes.

## Setup steps verified working (README §Run / Build / Tests)

| Documented step | Result |
|---|---|
| `npm run build` | ✓ green — `✓ built in 355ms`, 8 HTML entries emitted to `dist/` |
| `npm run test:e2e` (Playwright) | ✓ command resolves — `playwright test --list` → **19 tests in 3 files** (`game-flows`, `map-error-fallback`, `modal-accessibility`) |
| `npm run dev` port/path | ✓ `vite` serves `http://localhost:5173/Eit-carbon-capture-game/` (base path matches `vite.config.js`) |
| "no env variables" claim (README + SYSTEM_OVERVIEW) | ✓ accurate — only `process.env.CI` exists, and only in `playwright.config.js` (test runner), not app code |

## Onboarding-critical facts re-verified against HEAD — all still accurate

- `docs/SYSTEM_OVERVIEW.md`: `game.js` "~16k lines" → actual **16,216** ✓;
  "eight HTML entry points" → `vite.config.js` wires exactly **8** ✓; base path
  `/Eit-carbon-capture-game/` ✓; `localStorage` key `carbonCaptureGameSave` ✓;
  "single-slot autosave" ✓.
- Root `README.md` (CAR-63) and `docs/SYSTEM_OVERVIEW.md` (CAR-64) present and
  fresh. `docs/meta/SKILLS.md` (CAR-134) and the stray-docs auditor scope
  (CAR-157) remain fixed from CAR-240.

## No new docs drift from the two code changes since CAR-240

- **CAR-49 brand theme** (`style.css` `:root` repointed to the green/carbon Brand
  Package v1.0 palette): `brand/README.md` documents the new palette and matches.
  The "Gold" claims in `docs/IMPLEMENTED.md` and `DEMO_DESCRIPTION.md`
  (achievement-toast border, breakthrough event) are **still accurate** — see the
  cross-role flag below — so no doc became false.
- **CAR-185 icon re-compression**: binary-only PNG change, no doc references it.

## Cross-role flag (NOT re-filed here — design's remit, may fall under CAR-49 scope)

CAR-49's brand alignment looks **incomplete in CSS**, not in docs: `:root` tokens
are now green, but several component styles still carry the *old* gold literals —
`.achievement-toast` `border: 2px solid #ffd700` (style.css ~4777) and
`.event-popup.breakthrough .popup-header` / `breakthroughGlow`
`rgba(240, 198, 111, …)` (style.css ~5337/5350) — while the sibling
`.popup-title` already uses the new green `var(--accent-strong)`, giving the
breakthrough popup a mixed gold-header / green-title look. This is a design/brand
consistency item, not a docs defect, and likely belongs to the open brand backlog
(CAR-49 "[brand/a11y fix] … undefined CSS custom properties"). Flagging for the
Designer rather than opening a duplicate docs issue.

## Tracked gaps re-confirmed valid — NOT re-filed (no-duplicate guardrail)

| Issue | Gap | Status this run |
|---|---|---|
| CAR-164 | `game_rules.html` claims Export/Import JSON saves — not implemented | Still claimed; product decision, not a typo |
| CAR-165 | "3 save slots" claim — only one auto-save slot exists | Single-slot autosave confirmed in code + SYSTEM_OVERVIEW |
| CAR-175-N1 | `report/` git submodule uninitialized + undocumented in onboarding | Unchanged |

## Disposition

Nothing new rose to the bar of a docs fix or a new docs issue this cycle. Setup
verified working (build green, 19 e2e tests wired, no env-var drift), onboarding
facts re-verified accurate, and the only two code changes introduced no doc
drift. One cross-role brand-consistency flag handed to Design. Long-tracked
feature-claim drifts (CAR-164/165) and the submodule onboarding gap (CAR-175-N1)
re-confirmed, not duplicated. **CAR-258 → done.**
