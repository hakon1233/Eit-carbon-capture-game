---
name: runbooks-index
description: Index for operational runbooks — deploy, rollback, troubleshoot, incident response, env setup. Numbered steps with commands and expected output.
type: reference
last_reviewed: 2026-04-25
---

# Runbooks

Step-by-step operational procedures for deployment, troubleshooting, and maintenance.

## Runbooks

- [improvement-loop.md](improvement-loop.md) — the standing gameplay improvement loop (founder-reported bug/balance → fix → in-game QA verify → close/re-open).

## What goes here

- Deployment procedures (how to deploy, rollback, verify)
- Troubleshooting guides (common errors and how to fix them)
- Incident response (what to check when things break)
- Maintenance tasks (database migrations, cache clearing, log rotation)
- Environment setup (how to get a new dev machine running)

## Format

Write for someone who has never seen this project. Each runbook should be self-contained with exact commands to run. Use the deploy-verify skill (`.claude/skills/deploy-verify/`) for post-deploy checks.
