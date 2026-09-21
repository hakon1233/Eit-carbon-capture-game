---
title: Docs & Onboarding Freshness Pass — CAR-240
auditor: Generalist Advisor
date: 2026-06-26
target: Eit-carbon-capture-game (HEAD 16b9136 → 938b439)
---

# CAR-240 — Docs & Onboarding Freshness Pass (Findings)

Vanilla-JS + Vite browser strategy game, multi-page, no backend. Recurring
quality pass. **No feature work has landed since CAR-226** (the previous docs
pass sits at HEAD), so the needle-mover this cycle was to *resolve* two
long-tracked docs gaps directly rather than re-confirm them for a 5th time.

## Fixed directly this pass — commit `938b439`

| Item | What was wrong | Fix |
|---|---|---|
| **CAR-134** — `docs/meta/SKILLS.md` dead pointer | `AGENTS.md:86` and source-of-truth `.claude/project/AGENTS.part.md:50` advertise "the classified version is at `docs/meta/SKILLS.md`", but that file never existed — a dead onboarding link carried through 4+ passes. Root cause: it is a *generated* artifact (`scripts/docs/generate-skills-index.sh`, "committed and auto-syncs to the vault" per `docs-governance`) that was simply never run/committed. | Ran the generator → committed `docs/meta/SKILLS.md` (106 lines, inventory of 47 skills/commands/agents). The pointer now resolves. |
| **CAR-157** — stray-docs auditor allowlist drift | `scripts/docs/audit-stray-docs.sh` in-scope list predated the `scripts/compose-workspace.sh` harness/project layering, so it flagged ~55 legitimate source-layer files under `.claude/harness/**` and `.claude/project/**` — burying the genuine signal in noise and making the enforce command unusable. | Added both source layers to the auditor's out-of-scope block (with a comment explaining they compose into the already-in-scope `.claude/{skills,commands,agents}` outputs). Auditor now reports only the **9 genuine root-level strays** (was ~60). |

**Verification:** `npm run build` → `✓ built in 418ms`, green. `docs/meta/SKILLS.md`
present so `AGENTS.md:86` resolves. Auditor still exits 1 — *correct*: 9 real
strays remain (see below) and moving them is a per-file user-confirmation flow,
out of scope for an unattended pass.

## Notes / honest caveats
- `docs/meta/SKILLS.md` classifies every entry as **project-specific** because
  `templates/claude-project-template/` is absent from this repo, so the
  generator has nothing to diff against. The generated header documents the
  classification rules, and the inventory itself is complete and browsable. The
  missing template is a separate, pre-existing, low-value condition — **not
  re-filed**.
- The `docs-governance` SKILL.md authoritative allowlist table (lines 21–30)
  also omits the harness/project layers, but that SKILL.md is a harness-owned
  composed artifact (locked read-only between version bumps), so it was left for
  the harness owner. The script is the actual enforcement and is now correct.

## Remaining genuine strays (real signal, NOT re-filed — already covered by CAR-157 scope / need user confirmation to move)
`docs/working-notes/ALLIANCE_BUGS_FIX_PLAN.md`, `docs/working-notes/BUGS.md`, `DEMO_DESCRIPTION.md`,
`EMISSIONS_DATA.md`, `data.md`, `data_sources.md`, `project-plan.md`,
`brand/README.md`, `public/modules/README.md`.

## Tracked gaps re-confirmed valid — NOT re-filed (no-duplicate guardrail)
| Issue | Gap | Status this run |
|---|---|---|
| CAR-164 | `game_rules.html:755` claims Export/Import JSON saves — not implemented | Still claimed; a product decision, not a typo |
| CAR-165 | "3 save slots" claim — only one auto-save slot exists | Continue works; the multi-slot claim is the stale part |
| CAR-175-N1 | `report/` git submodule uninitialized + undocumented in onboarding | Unchanged |

## Disposition
Two long-tracked docs gaps (CAR-134, CAR-157) **closed directly** — small,
reversible, build-green. The product-doc feature-claim drifts (CAR-164/165) and
the submodule onboarding gap (CAR-175-N1) remain tracked and were re-confirmed,
not duplicated. **CAR-240 → done.**
