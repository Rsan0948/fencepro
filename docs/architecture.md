# Architecture

> **Status:** Skeleton. Sections fill in as Lanes 2-5 land. Decisions made
> during scaffolding (Lane 1) are documented; downstream sections list
> headings only and will gain content as the work that justifies them ships.

## Overview

FencePro is a frontend-only single-page application: React 19 + Vite +
TypeScript, persists to `localStorage`, ships as a static bundle. There is
intentionally no backend. The Stripe-checkout and email-send flows are
implemented as TypeScript adapters with mock providers — the production
wire-up surface is documented but not built (see
[`integrations/stripe.md`](integrations/stripe.md) and
[`integrations/email.md`](integrations/email.md)).

## Data Layer

_Filled in by Lane 2._

Two-source pattern:

1. **Hardcoded defaults** in `src/data/defaults.ts` — committed, generic,
   nationally-applicable. Works out of the box for any contributor.
2. **Optional local override** at `src/data/local.ts` — gitignored, optional.
   When present, layers regional pricing, branding, demo projects.

Loader merges with local-wins-where-present precedence. UI shows a
non-intrusive banner on fresh clones telling contributors the override path
exists.

## Adapter Pattern (Payments + Email)

_Filled in by Lane 3._

Two services implemented as `Provider` interfaces with mock implementations:

- `PaymentProvider`: `createCheckoutSession`, `getSession`. Mock implementation
  routes to an in-app `/mock-checkout/:id` page that simulates Stripe's
  hosted checkout, then fires a synthetic webhook back into the app.
- `EmailProvider`: `send`. Mock implementation logs to console and pops a
  toast linking to a modal that previews the rendered HTML email.

Production wire-up: implement the same interface against a small backend
that holds the secret keys + handles real webhooks.

## Component Layout

_Filled in by Lane 2._

```
src/
├── theme.ts
├── types.ts
├── lib/{quote,format,storage}.ts
├── data/{defaults,local}.ts
├── services/payments/{types,mock-stripe,index}.ts
├── services/email/{types,mock-email,index}.ts
├── components/{atoms,charts,chat}/...
└── screens/{Dashboard,NewEstimate,ProjectDetail,FinalInvoice,MockCheckout}.tsx
```

## Persistence

_Filled in by Lane 2._

`localStorage` with a versioned schema. A small migration helper handles
schema bumps. No IndexedDB, no Dexie — the data volume doesn't warrant it.

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

_Filled in by Lane 2._ The Lane 1 baseline keeps `strict: false` so the
unmodified prototype's `useState({})` patterns don't break typecheck. Lane 2
turns on full strictness as part of the typed refactor.

### Local data override location

**Decision:** `src/data/local.ts`, gitignored, optional.

**Rationale:** Co-located with `src/data/defaults.ts` so the loader's
import path is trivially predictable. Vite's resolution is cleanest when
the override is inside `src/`. Putting it at project root would require a
custom alias.

**Trade-off:** Contributors must remember `src/data/` not `data/`. The
README + a fresh-clone banner advertise the path.
