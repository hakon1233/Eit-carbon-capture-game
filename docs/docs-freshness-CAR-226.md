---
title: Docs & Onboarding Freshness Pass — CAR-226
auditor: Generalist Advisor
date: 2026-06-26
target: Eit-carbon-capture-game (HEAD c3a392c → b20b6d4)
---

# CAR-226 — Docs & Onboarding Freshness Pass (Findings)

Vanilla-JS + Vite browser strategy game, multi-page, no backend. This is a
recurring quality pass; prior passes landed the root `README.md`,
`docs/SYSTEM_OVERVIEW.md`, `docs/README.md`, and `AGENTS.md`. Audited the docs
that drift fastest against code: player-facing rules, setup commands, and the
new feature commits since the last pass (CAR-100/198/207/216/217).

## Fixed directly this pass

### 1. `game_rules.html` win/lose conditions drifted from `GAME_CONFIG` — commit `b20b6d4`
The single highest-value finding: the player Rules page stated the **core
win/lose conditions wrong**. The in-game tutorial and `game_mechanics.html`
already had the correct values, so `game_rules.html` was the stale page.

| Claim (before) | Code (truth) | Fix |
|---|---|---|
| Victory: "reduce temp to ≤1.0°C **at any point**" | `winTemp:1.0`, requires `winStreakMonths>=12` and only counts from `minWinYear=2050` (game.js:15190,15307) | "Hold ≤1.0°C for **12 consecutive months**, counting from **2050**" |
| Defeat: "temperature reaches **≥3.0°C**" | `loseTemp:2.0`, `loseStreakMonths>=3` (game.js:101,15198,15311) | "Stays at **≥2.0°C** for **3 consecutive months**" |
| ppm table: "655 ppm / +3.0°C (LOSE)" | LOSE threshold is +2.0°C → 530 ppm via the page's own `(ppm-280)×0.008` formula | "530 ppm / +2.0°C (LOSE)" — `(530-280)×0.008 = 2.0` ✓ |

Impact: a player following the Rules page would expect headroom to +3.0°C and
be surprised to lose at +2.0°C. Build green (`vite`, 312ms).

### 2. `showPowerBuildModeDialog()` lacked a header doc — commit (this pass)
The CAR-217 power build-mode dialog (Add Capacity vs Replace Fossil) had dense
inline math comments but no top-level explanation of *why* power projects branch
to a dialog or how the auto-retire amount is derived (energy-equivalence, not
nameplate GW). Added a JSDoc block at game.js:11528. Build-neutral.

## Verified clean (no action)
- Root `README.md` + `docs/README.md`: `npm install/dev/build/test:e2e`, dev URL,
  base path `/Eit-carbon-capture-game/`, localStorage key `carbonCaptureGameSave`
  all match `package.json` / `vite.config.js` / source.
- `docs/SYSTEM_OVERVIEW.md`: `nextMonth()`/`updateEndgameStreaks()` names,
  `DIFFICULTY_MODES`, and the 8 entry points all current. **`rules.html` IS a
  real vite entry** (vite.config.js:12) — earlier suspicion of a dangling
  reference was wrong.
- `game_mechanics.html` temperature table: +2.0°C correctly marked LOSE;
  +3.0°C "Extreme LOSE" is an intentional severity gradient, not an error.
- CAR-100 (map fallback) / CAR-216 (back links) are UX-only, no player-doc change.
- CAR-217 "Replace Fossil" is already documented in `game_mechanics.html`.

## Tracked gaps re-confirmed valid — NOT re-filed (no-duplicate guardrail)
| Issue | Gap | Status this run |
|---|---|---|
| CAR-134 | `AGENTS.md` → `docs/meta/SKILLS.md` dead pointer | `docs/meta/` still absent |
| CAR-157 | `scripts/docs/audit-stray-docs.sh` allowlist drift | Still flags root-level stray `.md` files |
| CAR-164 | `game_rules.html:755` claims Export/Import JSON saves — not implemented | Still claimed; left to CAR-164 (a product decision, not a typo) |
| CAR-165 | "3 save slots" (`game_rules.html:753`) — only one auto-save slot exists | Continue button itself works; the multi-slot claim is the stale part |
| CAR-175-N1 | `report/` git submodule uninitialized + undocumented in onboarding | Unchanged |

## Disposition
Two small, reversible, build-green doc fixes landed directly (the needle-mover
being the win/lose correction). All other findings are already tracked by open
issues and were re-confirmed rather than re-filed.
