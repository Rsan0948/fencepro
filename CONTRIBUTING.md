# Contributing to FencePro

Thanks for considering a contribution. FencePro is an intentionally lightweight
vertical-SaaS template, so the bar for additions is "does this stay simple
enough to demo on a static deploy without a backend?"

## Setup

```bash
git clone https://github.com/Rsan0948/fencepro.git
cd fencepro
npm install
npm run dev
```

The dev server runs on http://localhost:3001.

## Local data customization

FencePro ships with hardcoded system defaults that work out of the box.
If you want richer demo data (regional pricing, custom company name,
realistic project list), create `src/data/local.ts` — it's gitignored and
takes precedence over the defaults. See `docs/architecture.md` for the
data-layer contract.

## Workflow

1. Fork and create a feature branch from `main`.
2. Run the full check before pushing:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
3. Open a PR with a clear description of what changed and why.

CI runs the same checks. PRs that don't pass CI won't be merged.

## Code style

- ESLint + Prettier are enforced via pre-commit and CI. `npm run format`
  applies fixes.
- TypeScript strict mode. Avoid `any`; prefer narrow types.
- Components stay small; split when a file exceeds ~250 lines.
- No comments unless the _why_ is non-obvious. Identifiers should explain
  _what_.

## Commits

- One logical change per commit. Don't bundle unrelated work.
- Imperative-mood subject under 70 characters. Body explains the why.

## Scope

In scope: estimate flow, dashboard, project lifecycle, mock-payment +
mock-email integrations, regional data layer, accessibility improvements.

Out of scope: heavyweight backends, real payment processor wiring (the
adapter pattern is intentionally mocked — see `docs/integrations/stripe.md`),
multi-tenant infrastructure, mobile-native ports.

## Reporting bugs

Open a GitHub issue with reproduction steps and what you expected vs. what
happened. For security issues, see [SECURITY.md](SECURITY.md) — don't open
a public issue.
