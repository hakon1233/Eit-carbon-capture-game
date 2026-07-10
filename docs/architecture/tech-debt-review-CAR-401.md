# Architecture & Tech-Debt Review — CAR-401 (2026-07-10)

**Reviewer:** CTO. **Commit reviewed:** `5f2fe91` → landed at `e6f0f40`, `main`.
**Scope:** Recurring quality-loop architecture pass. This is a *thin* pass by design:
a comprehensive analysis-only deep audit landed **two days ago**
(`docs/audits/2026-07-08-deep-audit.md`, CAR-360; 34 findings A1–A12 / P1–P10 /
T1–T12) on top of the 2026-07-07 baseline (CAR-297). **Every** actionable finding
from both is already filed as backlog issues **CAR-341…CAR-393**. Re-auditing the same
16k-line monolith would only re-file tracked debt, which the guardrails forbid.

So this pass does the thing the two prior passes did **not**: it **lands** one of the
already-vetted, clearly-safe improvements, and provides a CTO sequencing overlay so the
engineers pull the tracked items in the order that de-risks the most future work.

## What was landed this pass

**Removed the dead `rules.html` + `systems.html` Vite entries and files** (86 KB of
shipped HTML). Verified clearly-safe before deleting:

- The live app (`index.html`) links only to the canonical `game_rules.html`.
- `systems.html` was linked from nothing; it was the *only* link into `rules.html`.
- `rules.html` was a stale fork of `game_rules.html` stating the **wrong win
  condition** (single-point ≤1.0 °C vs the real 12-month streak) and 3× wrong budgets —
  actively misinforming any player who reached it.
- No e2e/spec references either file; `npm run build` green, dist now emits only the
  correct pages.

This **resolves CAR-364** (rules.html stale fork) and **advances CAR-380**
(`public/climate-data.js` intentionally left — the reference HTML pages cite it as a
canonical file location, so its removal is a docs-coupled decision, not clearly-safe).

## CTO prioritization overlay (sequencing, not new findings)

The backlog is complete but flat. As the quality gate, the ordering that matters:

1. **Test-before-fix is a hard dependency, not a preference.** `CAR-381` (a test *pins*
   the G1 net-CO₂ unit bug as a golden value) and `CAR-382` (the 94× double-count fix
   has **no** regression guard) must land **before** any correctness fix in the
   sim/removal path (`CAR-362`, the CAR-57/G1 class). Landing a fix first will either be
   rejected by the bug-pinning test or ship unguarded. **Do these two first.**
2. **`CAR-362` (stale `ADVANCED_PROJECT_TYPES` + magic `/1000`) is the single
   highest-leverage correctness item** — it is the architectural bug-factory behind the
   whole CAR-57 / net-CO₂ class (two-sources-of-truth). Fix it right after its tests
   exist. It is small and reversible despite its blast radius.
3. **`CAR-373` (memoize `getDataForGranularity`) is the cheapest big player-felt win** —
   one module-scope Map over immutable static data removes ~4–5 ms CPU + ~2k allocs per
   tick with no invalidation risk. Do it independently of the split; it needs no
   architecture change.
4. **Start the monolith split at the free end, not the hard end.** `CAR-370` (move
   ~3,000 lines of pure data out of `game.js`, 0 coupling) then the sim core (0 DOM
   touches) are mechanical, reversible, and unlock unit testing — **not** diplomacy
   (`CAR-361`) or `nextMonth`, which are the hardest seams and should come last.

**Recurring meta-theme (unchanged, worth stating): "two sources of truth" is this
codebase's dominant defect** — project configs (CAR-362), CCS bonus (CAR-363), save
contract (CAR-369), stats grid (CAR-367), map modes (CAR-368), reference pages
(CAR-364/CAR-365). Each new fix should collapse a fork, never add one.

## No new debt filed

No product code changed between the 2026-07-08 audit and this pass (only the audit doc
commit + this change), so there is no new architectural debt to file. Do **not** re-file
A/P/T findings — they are CAR-341…CAR-393.
