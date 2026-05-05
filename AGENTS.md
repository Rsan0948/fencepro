# FencePro Agent Instructions

## Role

A fresh Claude (or Kimi) session launched in this repo should act as the
**implementation agent** for whatever lane brief Ruben hands you, executing
under HelicOps enforcement. The orchestrator role is owned by a separate
session running outside any HelicOps-gated project (typically from
`/Users/rubensanchez`).

The implementation agent's job:

- Execute the lane brief end-to-end against the file scope it defines
- Drive every source/config write through the HelicOps MCP pipeline
- Commit per logical unit with the `Co-Authored-By` trailer
- Run the full check chain before reporting done
- Surface scope questions to the orchestrator instead of widening unprompted

What the implementation agent does NOT do:

- Push to `origin/main` (orchestrator pushes after filter-before-push review)
- Use `git commit -a`, `git add -A`, or `git commit --amend`
- Override HelicOps blocks via `create_override` without explicit approval
- Drift past the brief's scope-out clauses

## Handoff Docs

Read these first when starting a lane:

1. The lane brief Ruben pastes (the source of truth for scope)
2. `CLAUDE.md` (workflow + HelicOps pipeline contract)
3. `docs/architecture.md` (current state + Decision sections)
4. The integration spec relevant to the lane
   (`docs/integrations/stripe.md`, `docs/integrations/email.md`)

## HelicOps Guardrail Enforcement

Source and config writes go through:

1. `get_generation_context`
2. `authorize_tool_call`
3. `get_applicable_guardrails`
4. `propose_write` with full file content
5. `validate_write`
6. `commit_write`

Direct `Write`/`Edit`/`MultiEdit` on `.ts`/`.tsx`/`.js`/`.jsx`/`.json`/
`.yaml`/`.yml` files is blocked by the PreToolUse hook. Documentation
(`.md`) and test files are exempt.

## Brief Discipline

The orchestrator authors lane briefs against the canonical 11-section
template (HelicOps `docs/orchestration_playbook.md` §2). Read the full
brief before starting; do not skim. Treat the Stop Condition as the
contract — the brief is done when those criteria are objectively met.

If the brief proposes a root cause for a bug, **verify empirically before
implementing the proposed fix** (HelicOps playbook §6 brief-quality rule).
False root-cause briefs have wasted multi-hour cycles in other projects.

## Cross-Lane Git Hygiene

FencePro currently runs single-agent / single-lane. If parallel lanes are
ever activated, every lane gets its own `git worktree` (HelicOps playbook
§3 hard rule). Even in single-lane mode, stage with explicit pathspec only
— `git commit -- src/file.tsx` not `git commit -a`.

## Scope of This Document

This file covers the implementation agent role. The orchestrator role's
playbook lives upstream in HelicOps_Live (`docs/orchestration_playbook.md`)
and in Ruben's persistent memory. If you find yourself drafting briefs or
making cross-lane decisions, you've drifted into orchestrator territory —
stop and surface to Ruben.
