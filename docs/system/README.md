---
name: system-index
description: Index for behavioral specs and system explanations — source-of-truth rules for how the game should behave, referenced during implementation and bug fixing.
type: reference
last_reviewed: 2026-04-24
---

# System

Core behavioral specifications and rules. These are the "source of truth" for how the system should behave — agents reference these when implementing features or fixing bugs.

## What goes here

- Behavioral specs (what the system does, not how it's built)
- Business rules and constraints
- API contracts and interface definitions
- State machine definitions
- Permission and access control rules

## Format

Write specs as requirements, not implementation details. Example:
- "When a user submits a form with invalid data, the system must show inline errors and not clear the form"
- NOT: "The handleSubmit function calls validateForm() which returns an array of errors"

The spec-check skill (`.claude/skills/spec-check/`) verifies code matches these specs.

## Files in this folder

| File | Description |
|------|-------------|
| [how-the-system-works.md](how-the-system-works.md) | How workflows, bug tracking, fix-loop, session logs, and vault sync fit together — source-of-truth for the overall agent system. |
