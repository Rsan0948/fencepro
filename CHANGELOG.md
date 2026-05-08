# Changelog

All notable changes to FencePro are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Lane 1 — scaffolding.** Apache 2.0 license, NOTICE, CODE_OF_CONDUCT,
  CONTRIBUTING, SECURITY. ESLint 9 (flat) + Prettier toolchain. Vitest +
  React Testing Library. GitHub Actions CI: lint, format check, typecheck,
  test, build on push and PR. Pre-commit hooks. README rewrite with badges
  and Quick Start. `docs/architecture.md` and
  `docs/integrations/{stripe,email}.md` skeletons. HelicOps MCP integration
  for guarded source writes.
- **Lane 2 — split, types, data layer.** `src/App.tsx` decomposed from an
  832-line monolith into a 128-line state container plus typed atoms,
  charts, chat steps, nav, project rows, screens, and lib utilities. TS
  strict mode turned on. `src/data/{types,defaults,index}.ts` ships the
  `LocalData` contract with a Vite `import.meta.glob` loader for the
  optional `src/data/local.ts` override. `src/lib/storage.ts` adds a
  versioned `localStorage` envelope. `DefaultsBanner` surfaces on
  fresh clones. Lib tests cover quote, format, storage.
- **Lane 3 — mock providers + checkout.** `src/services/payments/` ships
  `MockStripeProvider` with a synthetic webhook surface
  (`registerPaymentWebhook`, `markSessionPaid`). `src/services/email/`
  ships `MockEmailProvider` plus three template renderers (estimate sent,
  final invoice, payment receipt). `react-router-dom@^7` added; the
  `/checkout/:sessionId` route renders `MockCheckout` with the
  Stripe-style hosted-checkout layout. `App.tsx` wires Send Estimate /
  Send Final Invoice / pay → status flip + receipt email + toast.
  `Toast` and `EmailPreviewModal` give reviewers a clickable preview
  surface for the rendered emails. Dashboard project rows render an
  inline `(demo) Simulate client payment` Link when the project carries
  an outstanding `checkoutUrl`.
- **Lane 4 — component + integration tests.** Tests for `DefaultsBanner`,
  `Dashboard`, `EstimateCard`, `MockCheckout`, plus a centerpiece
  integration test (`tests/integration/estimate-flow.test.tsx`) that
  drives the full chat → send → preview → checkout → pay → status flip
  flow. CI gains a `npm run test:coverage` step (no threshold gate).
  `@vitest/coverage-v8` added to dev dependencies.

### Fixed

- **C-1 (Lane 2):** `calcQuote` no longer ignores the selected county —
  the prototype's `linearFeet > 200 ? "Denver" : "default"` heuristic is
  replaced with `data.countyRates[county] ?? data.countyRates.default`.
- **C-2 (Lane 2):** Adjustments survive a navigation round-trip.
  `ProjectDetail` no longer holds adjustments in local state; it calls
  the lifted `onAddAdjustment(projectId, adjustment)` callback so the
  shared `projects` array updates.
- **C-3 (Lane 2):** Project state persists across browser refresh via the
  versioned `fencepro:projects:v1` localStorage envelope.
- **Lane 4:** App no longer unmounts when the user navigates to
  `/checkout/:sessionId`. The pre-fix Routes layout in `main.tsx`
  unmounted App on every route change, deregistering the synthetic
  webhook handler before `markSessionPaid` could fire it. Routes now
  live inside `App.tsx`; App stays mounted for the entire session.

### Changed

- `src/App.tsx` collapsed from 832 lines (Lane 1 prototype) to a router
  + state container + flow callbacks.
- `eslint.config.js` no longer excludes `src/App.tsx`; the file lints
  clean alongside the rest of the source tree.
- `tsconfig.app.json` flips the strict family on. The Lane 1
  `// @ts-nocheck` pragma in `App.tsx` is removed.
- `src/data/defaults.ts` replaces the prototype's Colorado-specific
  county list and pricing with neutral, nationally-applicable
  placeholders. The Colorado data lives in the user's gitignored
  `src/data/local.ts`.

### Notes

- `src/data/local.ts` is gitignored. Drop it in to override company,
  counties, county rates, fence types, prices, and seed projects.
- The mock providers are configured to construct with `delayMs: 0` when
  `import.meta.env.MODE === "test"` so the integration test runs in real
  time without `vi.useFakeTimers`.
