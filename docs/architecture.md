# Architecture

## Overview

FencePro is a frontend-only single-page application: React 19 + Vite +
TypeScript, persists to `localStorage`, ships as a static bundle. There is
intentionally no backend. The Stripe-checkout and email-send flows are
implemented as TypeScript adapters with mock providers — the production
wire-up surface is documented but not built (see
[`integrations/stripe.md`](integrations/stripe.md) and
[`integrations/email.md`](integrations/email.md)).

## Data Layer

Two-source pattern, defined in `src/data/`:

1. **`defaults.ts`** — committed, generic, nationally-applicable. Ships
   the `LocalData` shape (`company`, `counties`, `countyRates`,
   `fenceTypes`, `prices`, `projects`) with neutral placeholder values
   (Acme Fence Co., a generic 8-county list, uniform `$24/$38` rate, neutral
   round-number material prices, three sample projects covering the
   `paid`/`active`/`pending` statuses). The repo works out of the box.
2. **`local.ts`** (gitignored, optional) — when present, layers regional
   pricing, branding, demo projects.

`index.ts` is the loader. It uses Vite's
`import.meta.glob<{ default: Partial<LocalData> }>("./local.ts", { eager: true })`,
so the absence of `local.ts` resolves to an empty module map without runtime
errors. Merge semantics:

- `company`, `countyRates`, `prices` — shallow per-key override (local
  fields win where present, defaults fill the rest).
- `counties`, `fenceTypes`, `projects` — full replace when the local
  override sets them; defaults otherwise.

The loader exports `data: LocalData` and `isLocalLoaded: boolean`. The
`DefaultsBanner` component reads `isLocalLoaded` to render the
"running with default data" pointer on fresh clones.

## Adapter Pattern (Payments + Email)

Two services in `src/services/`, each behind a typed `Provider` interface.

### `PaymentProvider` (`src/services/payments/`)

Interface signature is the design target real Stripe will eventually
implement:

```ts
createCheckoutSession(input): Promise<{ id, url }>;
getSession(id): Promise<PaymentSession>;
```

`MockStripeProvider` keeps an in-memory `Map<sessionId, MockSessionRecord>`,
returns `cs_mock_<...>` ids with matching `/checkout/<id>` urls, and exposes
a synthetic-webhook surface beyond the interface contract:

- `markSessionPaid(id)` (called by `MockCheckout` on Pay) flips the record
  to `paid` and fires every registered handler.
- `registerPaymentWebhook(handler)` (called by `App.tsx` on mount)
  returns an unregister function. The handler reads the session metadata,
  flips the project, fires the receipt email + toast.
- `getMockSessionRecord(id)` exposes the original input so `MockCheckout`
  can render line items.

The interface stays clean. Real Stripe's `RealStripeProvider` would call
the backend; the mock-only escape hatches stay alongside the singleton
in `index.ts`.

### `EmailProvider` (`src/services/email/`)

```ts
send(input): Promise<{ id, queued: true }>;
```

`MockEmailProvider` logs a structured envelope, queues the message
in-memory, and notifies subscribers. `templates.ts` ships three
`(subject, html, text)` renderers — `renderEstimateSent`,
`renderFinalInvoice`, `renderPaymentReceipt` — using plain template
literals with `escapeHtml` on every interpolated user-supplied value
(client names can't break out of the email body when rendered into the
preview modal).

App-level flows compose: when the user clicks "Send Estimate",
`handleSaveEstimate` creates a deposit checkout session, sends the
estimate email with the absolute `/checkout/<id>` URL, and pushes a toast.
The receipt email fires from inside the webhook handler.

## Component Layout

```
src/
├── App.tsx                     # state container + routing host
├── main.tsx                    # BrowserRouter + <App />
├── index.css                   # @font-face + @keyframes only
├── theme.ts                    # design tokens (`t`) + font constants
├── types.ts                    # Project, Adjustment, Quote, ...
├── vite-env.d.ts               # vite/client types
├── data/                       # LocalData + defaults + import.meta.glob loader
├── lib/
│   ├── format.ts               # fmt, fmtD, fenceLabel
│   ├── quote.ts                # calcQuote (county-aware)
│   ├── storage.ts              # versioned localStorage envelope
│   └── useIsMobile.ts          # matchMedia(max-width: 768px)
├── services/
│   ├── payments/{types,mock-stripe,index}.ts
│   └── email/{types,templates,mock-email,index}.ts
├── components/
│   ├── atoms/                  # Card, Pill, HoverBtn, ConfBtn, Label, Slider, StatusBadge
│   ├── charts/DonutChart.tsx
│   ├── chat/                   # ChatBubble, TypingDots, CountyPicker, FencePicker, DimensionsStep, CrewStep
│   ├── nav/                    # NavItem, Topbar
│   ├── projects/               # ProjectRow, EstimateCard
│   └── system/                 # DefaultsBanner, Toast, EmailPreviewModal
└── screens/
    ├── Dashboard.tsx
    ├── ProjectDetail.tsx
    ├── NewEstimate.tsx
    ├── FinalInvoiceModal.tsx
    └── MockCheckout.tsx
```

No barrel files. Direct imports keep the dependency graph readable and the
tree-shake clean. `src/data/index.ts` is the only `index.ts` that exists,
because the loader is the entry point for the data module.

## Persistence

`localStorage`, scoped to a single key:

```ts
const KEY = "fencepro:projects:v1";
type StoredEnvelope = { schemaVersion: 1; projects: Project[] };
```

`src/lib/storage.ts` wraps the read/write with a typed envelope. Schema
mismatches return the seed instead of throwing, and each stored project
is sanitized field-by-field on load (non-object entries dropped, missing
`adjustments`/`notes` defaulted, non-finite numbers coerced to 0) so a
hand-edited entry can't crash the dashboard. `App.tsx` seeds projects
state from `loadProjects(data.projects)` on mount, and a `useEffect` on
`projects` saves the envelope on every change; save failures
(quota/private mode) log a warning instead of throwing. Bumping the schema version
takes a one-line const change plus a migration helper if old data needs
to be reshaped — there's no IndexedDB, no Dexie, nothing else to evict.

## Routing

`src/main.tsx` mounts `BrowserRouter` once at the document root and renders
`<App />` directly underneath. **Routes live inside `App.tsx`**, not in
`main.tsx`. Why: App holds the shared state — projects, toasts, the
synthetic webhook subscription — and that state needs to survive the
user's trip to `/checkout/:sessionId` and back.

The Lane 4 integration test caught this empirically. The pre-fix layout
(`<Routes>` in `main.tsx` matching `App` at `path="*"` and `MockCheckout`
at `path="/checkout/:sessionId"`) unmounted `App` the moment the user
navigated to the checkout page. App's `useEffect` cleanup deregistered
the webhook handler before `markSessionPaid` could fire it; the project
status never flipped, the receipt email never sent.

The fixed shape:

```tsx
// main.tsx
<BrowserRouter><App /></BrowserRouter>

// App.tsx — render
<>
  <Routes>
    <Route path="/checkout/:sessionId" element={<MockCheckout />} />
    <Route path="*" element={<DashboardLayout />} />
  </Routes>
  <Toast .../>
  <EmailPreviewModal .../>
</>
```

`App` stays mounted across navigation. The toast queue and email preview
modal sit outside `<Routes>` so they're always available even on the
checkout page.

The dashboard / new-estimate / project-detail surfaces live in App's
internal `screen` state rather than in URLs. They're reached via a
`screen`-state pattern that long predates the Lane 3 router add. Only the
mock checkout earned a real route.

## Responsive Design

One breakpoint: `768px`. Every screen renders cleanly down to iPhone SE
(`375px`).

`src/lib/useIsMobile.ts` is a 15-line hook over
`window.matchMedia("(max-width: 768px)")`. SSR-safe (returns `false`
before mount), re-renders on breakpoint change via `addEventListener`,
cleans up on unmount.

The pattern across screens:

- **Same component, internal layout branches.** No `isMobile ? <X /> : <Y />`
  — that fragments state and behavior. Branches are inline ternaries on
  styles.
- **No CSS-in-JS migration.** Inline styles plus `useIsMobile()` is the
  established pattern. `react-responsive` and similar packages cost more
  in bundle size than they save.
- **No multiple breakpoints.** If a single layout genuinely needs a
  stricter cut (the `EstimateCard` 3-card row at 600px), use a one-off
  inline `window.matchMedia` rather than introducing a breakpoint system.

Per-screen highlights:

- **Topbar** — collapses nav labels to icon-only on mobile, tightens
  horizontal padding.
- **Dashboard** — donut + revenue cards stack vertically; project rows
  switch from grid table to vertically-stacked cards; the
  `(demo) Simulate client payment` link becomes a full-width button at
  44px tall.
- **NewEstimate** — chat input panel drops `position: fixed` on mobile
  to avoid fighting iOS Safari's keyboard; lives inline with the
  conversation and uses `scrollIntoView` after each message.
- **EstimateCard** — header amount + margin stack; deposit/balance card
  row goes 1-col; tabs full-width.
- **ProjectDetail** — Financial Summary + Project Details two-col grid
  collapses to a vertical stack.
- **MockCheckout / FinalInvoiceModal** — already constrained to 460px
  max-width; verify 16px lateral padding at `375px`.
- **Toast** — full-width-bottom (16px lateral margin) instead of
  bottom-right corner.
- **EmailPreviewModal** — near-full-screen with 16px outer margins on
  mobile.

Touch target floor: 44px tall on every interactive element on mobile
(matches Apple's HIG; Android's 48dp guideline gets the same treatment).

## Decisions

### Frontend-only, no backend

**Decision:** Ship FencePro as a static SPA. Mock all third-party integrations.

**Rationale:** Portfolio + template framing. The architectural discipline
(adapter pattern, interface-driven services, demoable on a static host) is
more interesting to a reviewer than a real Stripe wire-up. Eliminates the
secret-handling problem entirely. OSS contributors can run the full lifecycle
without a Stripe account.

**Trade-off:** A real production deployment requires the integrator to
build their own backend. The interface contract is documented; the
implementation is intentionally absent.

### Apache 2.0 license

**Decision:** Apache 2.0, matching `calculus_animator` and `digital-sangha`.

**Rationale:** Permissive enough for forking and commercial reuse;
includes patent grant; widely understood by enterprise legal teams.

### TypeScript strict mode

**Decision:** Full strict family on (`strict`, `noImplicitAny`,
`strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`,
`strictPropertyInitialization`, `alwaysStrict`, `noImplicitThis`).

**Rationale:** Lane 1 carried the unmodified prototype with `strict: false`
so its `useState({})` patterns wouldn't break typecheck. Lane 2's split
made every prop explicit, removed the temporary `// @ts-nocheck` pragma
on `App.tsx`, and turned strict on. Strict caught real `unknown` lookups
in `storage.ts`'s schema-validation guard and the C-1 county-aware quote
fix; without it, the `prices[fenceType] || prices.wood_privacy` fallback
silently typed as `any` in the prototype.

**Trade-off:** Existing prototype patterns (e.g. `useState({})` for
state objects) had to be replaced with explicit shapes during the Lane 2
split. That's the right cost — types are the documentation that doesn't
go stale.

### Local data override location

**Decision:** `src/data/local.ts`, gitignored, optional.

**Rationale:** Co-located with `src/data/defaults.ts` so the loader's
import path is trivially predictable. Vite's resolution is cleanest when
the override is inside `src/`. Putting it at project root would require a
custom alias.

**Trade-off:** Contributors must remember `src/data/` not `data/`. The
README + a fresh-clone banner advertise the path.

### Single BrowserRouter, Routes inside App

**Decision:** `main.tsx` wraps a bare `<App />` in `BrowserRouter`. Routes
live inside `App.tsx` so App stays mounted across navigation.

**Rationale:** App owns the synthetic-webhook subscription and the
toast/email-preview state. The naive layout (Routes in `main.tsx` with
`App` matched at `path="*"`) unmounts App when the user enters
`/checkout/:sessionId`, deregistering the webhook handler before the Pay
button fires it. Lane 4's integration test caught this empirically; the
fix moved Routes inside App.

**Trade-off:** App is bigger by a few lines. Acceptable cost for a
single-source app-state model that survives navigation.
