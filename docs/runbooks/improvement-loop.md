---
name: improvement-loop
description: The standing gameplay improvement loop — how a founder-reported bug or balance complaint flows intake → diagnose → fix → in-game QA verify → close, with an explicit "still broken → re-open" step. Roles, classification, execution policy, and exact commands.
type: reference
last_reviewed: 2026-06-15
owner: CTO
---

# Gameplay Improvement Loop

The repeatable cycle that turns a founder-reported problem into a **verified** fix
without per-item babysitting. Stood up by the CTO (issue CAR-2).

Two problem classes flow through the same loop:

1. **Bug** — something broken or behaving wrong.
2. **Balance** — numbers that make the game unrealistic or not fun (budgets, costs,
   emissions/temperature math, difficulty scaling, project payoffs, …).

## Roles

| Role | Agent | Owns |
| --- | --- | --- |
| Engineer | `cb223f72-8920-4679-9c2b-cd3e66498b03` | Reproduce, diagnose, fix, push to `main`. |
| QA-live | `8b9bd9c1-0f06-45db-98ec-6011424e1367` | Verify the fix **in the running game** via browser. Pass → close; fail → re-open. |
| CTO | `acb59202-6523-4aba-85a9-009454de4042` | Owns the loop; gates anything beyond pure bug/balance; monitors health. |
| CEO / founder | — | Feed items in; decide what is a problem. |

The Engineer never QAs their own fix — QA-live confirms independently (self-QA blind-spot).

## Tracking & classification (no per-item setup)

- **Parent epic:** every item is a **child issue of CAR-2** (`f28b517b-62d1-4282-b276-009cfd42f4d2`).
  This auto-rolls the whole loop into one work-stream and one inheritance tree.
- **Class via title prefix:** `[bug]` or `[balance]` at the start of the issue title.
  Zero label infrastructure required; visible on the board; greppable.
- **One item = one child issue.** Don't batch unrelated complaints into one issue —
  it breaks the verify/re-open granularity.

### Intake template (CEO or CTO files this, ~30s, no design needed)

```
Title:    [bug] <one-line symptom>           # or [balance]
Parent:   CAR-2
Assignee: Engineer (cb223f72-8920-4679-9c2b-cd3e66498b03)
Priority: high for bugs that block play; medium otherwise
Body:
  **Reported by:** founder, <date>
  **Symptom:** what they saw.
  **Repro:** steps / screen / which screen of the game.
  **Expected:** what should happen (for balance: what number feels wrong & why).
  **Acceptance:** the concrete condition QA-live checks in the running game.
ExecutionPolicy: { mode: "auto" }            # see policy below
ReviewStage:     QA-live as reviewer          # forces an explicit pass/fail gate
```

## The loop

```
                 founder reports
                       │
              ┌────────▼────────┐
   intake     │ CEO/CTO files   │   [bug]/[balance] child of CAR-2,
              │  child issue    │   auto policy, QA-live review stage
              └────────┬────────┘
                       │ assigned: Engineer
              ┌────────▼────────┐
  diagnose/   │ Engineer:       │   reproduce → root-cause → fix in
    fix       │  fix + push main│   game.js / game.html → mark done
              └────────┬────────┘
                       │ → in_review (QA-live)
              ┌────────▼────────┐
   verify     │ QA-live runs    │   npm run dev → drive game in browser →
  IN-GAME     │  the real game  │   reproduce the original symptom path →
              └───┬─────────┬───┘   assert acceptance → screenshot evidence
                  │PASS     │FAIL
            close │         │ re-open  (reject review → back to Engineer,
        (done)    ▼         ▼           with what's still wrong + evidence)
                                        loops until PASS
```

### Engineer step — exact contract

1. Reproduce the symptom locally (`npm run dev`, open
   `http://localhost:5173/Eit-carbon-capture-game/game.html`, follow the repro).
2. Fix the root cause in `game.js` / `game.html` (not a symptom patch).
3. Commit + **push to `main`** (this project ships straight to main; a fix is not
   "done" until `git push` has landed). Trailer: `Co-Authored-By: Paperclip <noreply@paperclip.ing>`.
4. Move the issue to `in_review` and write a work-log entry: what was wrong, the fix,
   and the **exact repro path QA should drive** to confirm.

### QA-live step — exact contract (in-game, not code-reading)

```bash
cd ~/projects/school-reports/Eit-carbon-capture-game
npm install        # first run only
npm run dev        # vite serves on :5173
# open the GAME at (note the base path — bare /game.html 404s):
#   http://localhost:5173/Eit-carbon-capture-game/game.html
```

- Drive the **running game** through a browser (Playwright/claude-in-chrome MCP):
  walk the original repro path, then assert the acceptance condition.
- For **balance** items: play far enough that the number actually surfaces
  (e.g. advance turns until the budget/temperature value appears) and confirm it's
  now in the agreed range — not just that the constant changed in source.
- **Screenshot** the passing (or failing) state as evidence on the issue.
- **PASS** → close `done` with the evidence.
- **FAIL** → **re-open**: reject the review so the issue returns to the Engineer,
  with a comment stating exactly what is still wrong + the screenshot. The item
  loops; it never silently rots because the review gate forces an explicit verdict.

## Execution policy — auto vs. human gate

This is a **pre-launch school-project web game**: single `game.html` + `game.js`, no
external users, no auth, no persisted user data, no security/PII surface. A bad fix's
worst case is a visibly-wrong game — and QA-live catches that in the running game
**before** close. So:

- **Runs AUTO (no per-fix human approval):** the whole intake → fix → QA → close/re-open
  cycle for items classed `[bug]` or `[balance]`. The founder deciding to report an item
  **is** the human gate. No CEO setup per item.
- **Requires a CTO gate (not auto):** anything beyond a localized bug fix or number
  tweak — save/schema format changes, new features, dependency/build/tooling changes,
  bulk content deletion, or a "fix" that rewrites a whole system. The Engineer flags
  these to the CTO instead of shipping under the loop.

This keeps the founder hands-off while nothing structural ships unseen.

## Health monitoring (CEO/CTO)

- All open children of CAR-2 = the live queue.
- `[bug]`/`[balance]` re-opened more than **twice** = escalate to CTO (fix isn't
  converging; needs a deeper look).
- Stale child with no movement = the loop stalled; CTO investigates.

## What we still need from the founder/CEO

1. **Confirm the AUTO execution policy above** (or tell us where you want a gate).
2. **Intake channel:** founder reports in CEO chat → CEO (or CTO) files the child issue
   from the template. Confirm that's the channel, or name another.
3. Items can start flowing as soon as (1) is confirmed.
