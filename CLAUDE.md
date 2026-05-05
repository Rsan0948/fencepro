# FencePro Claude Session Instructions

## HelicOps guarded writes

This project uses HelicOps MCP guardrails. **Do not use Claude Code `Write`,
`Edit`, or `MultiEdit` directly for source or config files** — the
project-local PreToolUse hook (`.claude/hooks/helicops_guard.py`) blocks
those tools for covered paths.

Use the runtime-gated HelicOps MCP pipeline:

1. `get_generation_context(target_files, language, tool_intents)`
2. `authorize_tool_call(...)` for shell/package commands, migrations,
   destructive actions, or direct-write intents
3. `get_applicable_guardrails(file_path, operation_type)` for every target file
4. `propose_write(...)` with complete file contents, never unified diffs
5. `validate_write(proposal_id)`
6. `commit_write(proposal_id)` only after validation passes

## Rules for this repo

- Send full file content in `diff_or_content`; do not send patch fragments.
- For multi-file changes, use the `files` array in `propose_write`.
- If validation blocks, fix the proposed content and create a new proposal.
- Do not use `create_override` without explicit approval from Ruben.
- Preserve existing user changes. Do not revert unrelated work.
- Run targeted verification before handing work back. For a broad check, use
  `helicops check --project-root /Users/rubensanchez/Developer/fencepro`.

## Current baseline notes

- **Stack:** React 19 + Vite 7 + TypeScript 5.9, Vitest 2 + React Testing
  Library 16, ESLint 9 (flat config) + Prettier 3.
- **TypeScript driver only.** No Python, no Rust. The hook still blocks
  `.py`/`.json`/`.yaml` writes for parity with other HelicOps projects, but
  active scanning targets `.ts`/`.tsx`.
- **Lane 1 (scaffolding) shipped.** `src/App.tsx` is still the original
  monolithic prototype with a temporary `// @ts-nocheck` pragma; Lane 2's
  refactor splits it, adds proper types, and removes the pragma.
- **`src/data/local.ts` is gitignored.** It is the optional regional/branding
  override layered on top of the hardcoded defaults that ship with the repo.
  Do not commit it.
- **Mocks, not real integrations.** `services/payments/*` and
  `services/email/*` are TypeScript adapters with mock implementations.
  Real Stripe/Resend code is intentionally out of scope — wire-up notes
  live in `docs/integrations/stripe.md` and `docs/integrations/email.md`.

## Verification

Before handing work back:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

CI runs the same chain.

## Where to read more

- Architecture: `docs/architecture.md`
- Integration contracts: `docs/integrations/{stripe,email}.md`
- Contribution workflow: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
