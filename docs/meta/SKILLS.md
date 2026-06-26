# Skills Inventory — Eit-carbon-capture-game

_Generated 2026-06-26 09:16 by `scripts/docs/generate-skills-index.sh`. Do not edit by hand._

This file classifies every skill, slash command, and subagent definition in this repo against the project template at `templates/claude-project-template/.claude/`. Regenerate after any skill / command / agent is added, removed, or renamed.

- **Standard** — present in the template, content identical → safe default, maintained centrally.
- **Project-specific** — only exists in this repo.
- **Drifted** — present in both, content differs. Drift is often intentional.
- **Missing** — template has it, this repo doesn't. Flag for review.

## Skills (`.claude/skills`)

### Standard (matches template exactly)

_None._

### Project-specific (not in template)

- **audit-entry-point-configs** — When the user's prompt is open-ended audit of a project — 'review this', 'find what's wrong', 'investigate', 'check the recent work', 'something's broken' — invoke `Skill('audit-entry-point-configs')` BEFORE deep source review. The entry-point configs (package.json, next.config.*, vite.config.*, pyproject.toml, Cargo.toml, Makefile, docker-compose, Dockerfile) hold defaults, ports, scripts, and infrastructure conventions that are the most common bug site invisible to source-only review.
- **chrome-mcp-tab-safety** — Before calling any mcp__claude-in-chrome__* tool, running a `playwright` flow, or doing any UI check in this shared-browser environment: invoke `Skill('chrome-mcp-tab-safety')` and follow its tab-ownership rules — assume every tab you didn't create belongs to another agent.
- **commit** — ALWAYS invoke `Skill('commit')` before running `git add` or `git commit`, when the user says \"commit\", \"ready to commit\", \"create a commit\", or \"pre-commit\", and at every logical unit during longer tasks. Do not run `git commit` directly, do not batch unrelated changes into one commit, and do not skip the pre-commit checks — use this skill first; it owns the atomic-commit cadence and the audit-stray-docs / generate-skills-index pre-commit checks for docs or .claude/{skills,commands,agents}/ changes.
- **design-twice** — When the user says \"design this twice\", \"fan out the design\", \"give me 3 options\", \"let's compare designs\", runs `/design-twice`, or is about to commit to a non-trivial interface used in many call sites: invoke `Skill('design-twice')` BEFORE writing the interface — it dispatches 3 parallel read-only workers with different constraints and returns one opinionated synthesis.
- **dev-server** — Before starting, stopping, or checking any long-running dev server (`npm run dev`, `next dev`, `vite`, `wrangler dev`) for this project, or when the user says \"run the site\", \"open it in the browser\", \"start the dev server\", or \"bring it up on port X\": invoke `Skill('dev-server')` and use its named-tmux-session lifecycle instead of a bare background `exec`/`bash`.
- **docs-governance** — Before creating, renaming, or moving any `.md` file outside `src/`, or when the user says \"stray docs\", \"docs governance\", \"where should this doc live\", or runs the stray-doc auditor: invoke `Skill('docs-governance')` and place the file using its vault-synced allowlist and filename-heuristic table.
- **docs-writing** — Before creating or editing any file under `docs/`, writing a README, writing an ADR, updating a runbook, or writing explanatory prose in a SKILL.md: invoke `Skill('docs-writing')` and follow its Diataxis split, frontmatter contract, and per-folder INDEX rules.
- **engineering-standards** — ALWAYS invoke `Skill('engineering-standards')` before adding a file, writing a new abstraction, committing, fixing a bug, or claiming work is done — and whenever the user says \"build this\", \"add this\", \"fix\", \"refactor\", \"clean up\", or \"ship it\". Do not write code, edit files, or ship work directly without consulting this skill first — it owns the six stop rules (simplicity-before-complexity, first-run-correctness, root-cause fixes, clean complexity, scope discipline, intellectual honesty) that gate first-run-correct work.
- **env-bootstrap** — ALWAYS invoke `Skill('env-bootstrap')` as the FIRST tool call in every worker session, when a new dispatch-worker session begins, and when \"continue\"/\"resume\" is signaled. Do not start any other work, do not run exploratory `ls`/`which`/`pwd`, and do not edit files before this — use this skill first; it owns the env snapshot and the `runtime/progress.json` checkpoint that survives context resets.
- **explore-beyond-the-task** — When the user's prompt is open-ended exploration — 'review this', 'audit', 'find what's wrong', 'check the recent feature', 'investigate', 'look around' — and especially after you've already found and fixed ONE issue: invoke `Skill('explore-beyond-the-task')` and follow its enumeration discipline. Open-ended reviews almost always surface more than one finding; stopping after the first fix is the most common failure mode.
- **fewer-permission-prompts** — Before adding any entry to `.claude/settings.local.json` or its `.template` source, or when a worker session keeps stalling on \"Claude needs your permission to use Bash\" prompts: invoke `Skill('fewer-permission-prompts')` and use its three-bucket allowlist rules (always-allow / never-allow / ask) and deny-list invariants.
- **fix-loop** — When the user says \"fix loop\", \"run the fix loop\", \"test the X workflow\", or invokes `/fix-loop`: invoke `Skill('fix-loop')` to drive the workflow-scoped test/fix/verify run — it owns iteration bookkeeping and stop conditions, and delegates the bug-fix rhythm to `test-first`.
- **glossary** — Before coining a new entity name, action verb, or role label in code/comments/docs, or when naming feels ambiguous (User vs Account vs Member, fetch vs load vs sync, owner vs admin vs root): invoke `Skill('glossary')` and reuse the existing ubiquitous-language term instead of inventing a new one.
- **improve-architecture** — When the user says \"improve the architecture\", \"deslop the codebase\", \"refactor for depth\", \"improve modules\", \"find shallow modules\", or runs `/improve-architecture`: invoke `Skill('improve-architecture')` and run its three-phase explore → present → grill flow — it never refactors unilaterally; output is a candidate interface design recorded in CONTEXT.md / ADRs after user approval.
- **module-improvement-team** — When the user says \"run your round\", \"work your module\", \"propose your r<N> change\", or this session is a long-lived module-improvement agent (testing-loop, bug-hunt, router-benchmarks, scenario-benchmarks, custom-benchmarks, worker-benchmarks, repo-maintenance, or any future module agent) doing analysis-then-propose work: invoke `Skill('module-improvement-team')` BEFORE writing the proposal. It owns the 7-teammate council protocol — when to dispatch which specialist, the message budget, the memory contract, and the closeout that produces `runtime/night-shift/round-<N>/<module>/proposal.md`.
- **module-map** — Before creating a new module, splitting an existing one, scoping a worker task, planning where a feature lives, or making an Edit that crosses multiple subsystems: invoke `Skill('module-map')` and use its deep-modules-with-narrow-interfaces map (plus `LANGUAGE.md` vocabulary contract) to scope to one well-bounded unit.
- **plain-closeout** — Invoke `Skill('plain-closeout')` when closing out **substantial multi-step work** — after completing a feature, refactor, or bug fix that touched multiple files or required design decisions. Fire for 'done', 'shipped', 'ready' on work that took 2+ turns or crossed multiple concerns. Skip for quick Q&A, single-turn clarifications, follow-ups, or acknowledgements ('got it', 'starting now'). It owns the Understanding Card — plain-language summary proving you grasped the real problem and it works.
- **read-invariants-not-just-code** — When auditing a file (especially one touched by a recent change) or before declaring a file 'looks clean' or 'no defects': invoke `Skill('read-invariants-not-just-code')`. File-level JSDoc, top-of-file documentation, and inline 'always / must / never / should' assertions encode invariants that drive-by edits commonly violate. The code below a JSDoc comment may have drifted from what the comment promises — the bug is the drift.
- **refactor-plan** — Before pulling duplicated logic into a shared helper, extracting a function, splitting a class, or any cross-file dedup/restructure that preserves behavior: invoke `Skill('refactor-plan')` BEFORE editing — it owns the discipline of identifying the seams, planning the move, keeping the public API stable, and verifying no behavior change. Trigger phrases: 'extract this into a helper', 'pull the duplicated logic out', 'dedup these', 'split this module', 'restructure this'.
- **repo-structure** — Before creating a new file, moving a module, introducing a new directory, refactoring folder layout, writing \"utils.ts\"/\"helpers.ts\"/\"common.ts\", adding a file over 500 lines, or nesting code more than 4 levels deep: invoke `Skill('repo-structure')` and apply its 13 measured principles (size limits, depth limits, domain-verb names, feature-sliced layout).
- **session-logging** — ALWAYS invoke `Skill('session-logging')` at session start, after each meaningful unit of work, and before wrapping up. Do not edit `docs/sessions/YYYY-MM-DD.md` directly, do not skip the log when the work feels small, and do not defer logging to the end — use this skill first; it owns the entry format, the continuous-log cadence, and what counts as a meaningful unit.
- **test-first** — When fixing any bug, reproducing a failure, or processing /bug-test-loop, /fix-loop, or the user saying \"fix\", \"reproduce\", \"regression\", or \"red-before-green\": invoke `Skill('test-first')` BEFORE editing any code, then follow the red-before-green protocol it returns (reproducer file conventions, exit-code semantics 0/1/2, cross-file bug tracking, BUG-NNN markers).
- **two-stage-review** — After a worker reports completion (\"Done\") on any non-trivial task and BEFORE marking the task done in plans/orchestrator memory: invoke `Skill('two-stage-review')` to dispatch the spec-compliance then code-quality reviewer subagents — only mark the task done when both pass.
- **verification-before-completion** — ALWAYS invoke `Skill('verification-before-completion')` before saying \"done\", \"fixed\", \"shipped\", \"ready\", or marking any task complete. Do not claim success directly, do not rely on \"should work\" / \"looks good\" reasoning, and do not skip verification because the change feels small — use this skill first; it owns which verification command to run (test run, build, type-check, lint, manual probe) and requires that command to appear in the same assistant turn as the success claim.
- **workflow-management** — Before discovering, creating, renaming, or removing any workflow definition, or when the user asks to add a new user-facing flow that needs testing: invoke `Skill('workflow-management')` and follow its four-file workflow contract (registry + spec + bug file + fix-loop binding).
- **writing-skills** — Before creating, editing, promoting, or removing any file under `.claude/{skills,agents,commands}/`: invoke `Skill('writing-skills')` and follow its frontmatter contract, routing rules, skill-vs-agent decision flow, and template propagation flow.

### Drifted (present in both, content differs)

_None._

### Missing (in template but not in this repo)

_None._

## Commands (`.claude/commands`)

### Standard (matches template exactly)

_None._

### Project-specific (not in template)

_None._

### Drifted (present in both, content differs)

_None._

### Missing (in template but not in this repo)

_None._

## Agents (`.claude/agents`)

### Standard (matches template exactly)

_None._

### Project-specific (not in template)

- **boundary-hunter** — Read-only lens: 'what crosses the trust boundary?'. Dispatch in parallel with the other hunter agents during an open-ended audit. Hunts API-route handlers, request-parsing call-sites, query/path-parameter reads — flags fields used without validation or with weak validation. Returns structured JSON findings; never edits.
- **bug-fixer** — When fixing any bug, processing /bug-test-loop or /fix-loop, or when the user reports a failing behavior: dispatch this agent via `Agent(subagent_type='bug-fixer')` instead of doing the bug-fix work yourself — it owns red-before-green discipline (failing reproducer first, then fix) plus multi-bug triage for workflow sweeps.
- **bug-regression-tester** — When the user defers the fix and asks for a failing reproducer first ('don't fix yet', 'first nail down a repro', 'I just want a reproducer'): dispatch this agent via `Agent(subagent_type='bug-regression-tester')` instead of doing the work yourself — it owns reproducer-only discipline (red, no green) and is mutually exclusive with bug-fixer on the same prompt.
- **code-quality-reviewer** — As Stage 2 of the two-stage review pattern, after spec-reviewer approves a worker's diff: dispatch this agent via `Agent(subagent_type='code-quality-reviewer')` to read-only review the diff against engineering-standards (no lazy try/catch, no dead branches, consistent naming, tests for new branches, repo-structure rules). Returns APPROVED, REJECTED, or BLOCKED with specific notes — no writes or commits.
- **cross-reference-hunter** — Read-only lens: 'same fact in two places — do they agree?'. Dispatch in parallel with the other hunter agents during an open-ended audit. Hunts magic numbers, port literals, URL hard-codes, env-var defaults, repeated string constants, AND paired user-facing strings ('created N tasks' vs 'updated N' — mismatched plural/noun in the same builder) — flags every case where two sources state the same fact differently. Returns structured JSON findings; never edits.
- **error-handling-hunter** — Read-only lens: 'what happens when something fails?'. Dispatch in parallel with the other hunter agents during an open-ended audit. Hunts catch blocks, fallback returns, `?? default` expressions, `.catch(() => …)` chains, AND check-then-act file pairs (existsSync→readFileSync, statSync→writeFileSync, lstatSync→readFileSync) where the file can vanish between the two calls — flags handlers that silently drop errors, return wrong-type fallbacks, hide failure from upstream callers, or assume filesystem state holds across two syscalls. Returns structured JSON findings; never edits.
- **invariant-hunter** — Read-only lens: 'what does the code CLAIM to do — does it?'. Dispatch in parallel with the other hunter agents during an open-ended audit. Hunts file-level JSDoc, top-of-file documentation, README/ADR claims, inline 'always/must/never/sorted/leftmost' assertions, AND state-machine dead clauses (guard predicates that look correct but allow same-state→same-state transitions to bypass the check), then verifies the code below honors them. Returns structured JSON findings; never edits.
- **skill-router** — MANDATORY first subagent invocation in any worker session. Reads the user's prompt, decides which skills the worker must invoke before doing the task, and writes harness sentinels so the PreToolUse + Stop gates can mechanically enforce them. Invoke via Agent(subagent_type='skill-router') as your very first tool call after env-bootstrap. Do not attempt to route prompts yourself.
- **spec-reviewer** — As Stage 1 of the two-stage review pattern, after a worker reports completion on a non-trivial task: dispatch this agent via `Agent(subagent_type='spec-reviewer')` to read-only review whether the diff actually does what the task/spec asked for. Returns APPROVED, REJECTED, or BLOCKED with a short rationale — no writes or commits.
- **surface-hunter** — Read-only lens: 'what does the live app actually serve?'. Dispatch in parallel with the other hunter agents during an open-ended audit. Curls every linked route the dev server is running, parses the rendered HTML, and flags visible breakage — unstyled rendering, missing region/header, dead nav links, mis-labelled tabs, wrong color tokens. Returns structured JSON findings; never edits.
- **team-conservative** — Module-improvement council teammate. Rule-guard / red-team. Flags 'this looks like cheating', 'this contradicts ADR-X', 'this violates a skill contract', 'this can't ship without a harness bump'. Read-only. Declarative authority: any concern raised MUST be acknowledged in the proposal's Risks section.
- **team-creative** — Module-improvement council teammate. Proposes wilder, less-obvious directions — speculative reframings, unconventional approaches, 'what if' moves the lead wouldn't reach by default. Read-only — offers options, never decides.
- **team-history-librarian** — Module-improvement council teammate. Reads prior round proposals + merge plans, reports what was proposed, what shipped, what was deferred and why, and what got reproposed. Surfaces precedent so the team doesn't re-litigate decisions or lose deferred items. Read-only — never writes the proposal.
- **team-hypothesis-tester** — Module-improvement council teammate. When 2+ hypotheses explain the data, designs the CHEAPEST experiment that would falsify each one. Reports the diagnostic plan; lead decides whether to run it. Read-only.
- **team-logs-analyst** — Module-improvement council teammate. Heavy reasoning over campaign logs, transcripts, and sub-agent JSONLs. Reports what happened in this run + relevant prior runs, what worked vs didn't, and what didn't work but could work if done differently. Read-only — never writes the proposal itself.
- **team-statistician** — Module-improvement council teammate. Pushes back on causal claims from tiny samples. Computes effect-size estimates, sample-size requirements, and 'is this within noise' verdicts. Read-only. Declarative authority: if statistician flags a sample-size concern, the lead MUST acknowledge it in the proposal's Risks section.
- **team-web-researcher** — Module-improvement council teammate. OUTSIDE-the-project web research only — Anthropic docs, changelogs, blog posts, GitHub issues, Reddit/forums for prior art on whatever the team is stuck on. Never reads the project repo; that's history-librarian's job. Reports relevant patterns, named approaches, and concrete examples others have used.

### Drifted (present in both, content differs)

_None._

### Missing (in template but not in this repo)

_None._

