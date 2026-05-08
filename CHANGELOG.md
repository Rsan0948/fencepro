# Changelog

All notable changes to FencePro are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Close project action.** ProjectDetail gains a small `× CLOSE PROJECT` button next to the back affordance. Click prompts a `window.confirm`; on confirm, the project is removed from `projects` state, selection/invoice references are cleared, and navigation returns to the dashboard. Lets reviewers (or the operator) clear out test projects without going through the full deposit-or-final payment flow.

## [0.1.1] - 2026-05-08

Hardening patch built on top of v0.1.0. Closes nine P0 issues found
during pre-release manual testing of the chat → estimate → checkout
→ receipt flow. No new features. No breaking surface changes for
users of the typed services interfaces; `loadProjects`'s return shape
changed from `Project[]` to `{ projects, recovered }` for internal
callers.

### Fixed

- **EstimateCard send button** is now visually disabled (and a
  click no-op) until both client name and client email are filled.
  `ConfBtn` gains a `disabled?: boolean` prop.
- **FinalInvoiceModal** closes on Escape and on dim-backdrop click
  (clicks on the inner card stop propagation). `MockCheckout` also
  closes on Escape (navigates to `/`).
- **EmailPreviewModal** intercepts clicks on internal anchors in
  the rendered HTML and dispatches via React Router instead of
  triggering a full-page reload. External anchors fall through.
- **localStorage corruption** — `loadProjects` returns
  `{ projects, recovered }`. When `recovered=true` (JSON parse
  failure or schema mismatch), `App` surfaces a `(SYSTEM)` info
  toast: "Saved data was unreadable — loaded the default projects
  instead."
- **`calcQuote` county-rate fallback** — the data loader now
  asserts `data.countyRates.default` exists at module load time and
  throws with a helpful message naming `src/data/local.ts` if a
  local override drops it.
- **`calcQuote` linearFeet clamp** — non-finite, zero, or negative
  inputs clamp to 1 with a `console.warn`. Prevents NaN propagation
  into market low/high and section math.
- **Webhook receipt-email failures** no longer disappear into a
  silent `console.error`. They surface a `(SYSTEM)` info toast
  warning that the payment was recorded but the receipt did not
  queue.
- **Already-paid `MockCheckout`** sessions render a dedicated
  "Payment received" panel (centered card with the paid amount and
  a Back to FencePro button) instead of the full hosted-checkout
  layout with a disabled Pay button.
- **Toast queue** is now bounded to 4 visible entries (oldest drops
  on overflow) and every toast auto-dismisses after 8000ms via a
  per-toast `setTimeout` cleared on unmount or early dismiss.

### Changed

- `ToastEntry` is now a discriminated union of `email` and `info`
  kinds. Email toasts retain the click-to-preview affordance;
  info toasts render a `(SYSTEM)` tag with a title and optional
  body and dismiss without opening a preview modal.

## [0.1.0] - 2026-05-08

First public milestone. Lightweight vertical-SaaS template for fence
contractors: dashboard, chat-driven estimates, project lifecycle, and a
fully-typed mock of Stripe checkout + transactional email. Frontend-only,
mobile-responsive, production-ready as a portfolio reference for the
adapter pattern + interface-driven services architecture.

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
- **Lane 6 — mobile responsive pass.** `src/lib/useIsMobile.ts` hook
  (matchMedia subscription, single 768px breakpoint, SSR-safe). Every
  screen renders cleanly down to iPhone SE (375px): Topbar (icon-only
  nav), Dashboard (stacked donut row, project rows as cards), NewEstimate
  (inline chat panel instead of fixed-bottom), EstimateCard (stacked
  header + 1-col deposit grid), ProjectDetail (vertical financial
  summary), MockCheckout / FinalInvoiceModal / EmailPreviewModal
  (full-width-with-padding). Touch-target audit bumped HoverBtn,
  ConfBtn, NavItem, CountyPicker chips, and modal closes to ≥44px.
  `docs/architecture.md` placeholder sections (Data Layer, Adapter
  Pattern, Component Layout, Persistence) filled in; new Routing,
  Responsive Design, and TS strict mode decision sections added.
- **Lane 7 — release polish.** Screenshot pipeline (`npm run screenshots`)
  via Playwright, captures desktop + mobile pairs for the README. v0.1.0
  tagged + GitHub release.

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

- `src/App.tsx` collapsed from 832 lines (Lane 1 prototype) to a router +
  state container + flow callbacks.
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
