# FencePro

[![CI](https://github.com/Rsan0948/fencepro/actions/workflows/ci.yml/badge.svg)](https://github.com/Rsan0948/fencepro/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node 20+](https://img.shields.io/badge/node-20+-brightgreen.svg)](https://nodejs.org/)

Lightweight vertical-SaaS template for fence contractors. Dashboard,
chat-driven estimate builder, project lifecycle, and a fully-typed mock of
Stripe checkout + transactional email. Frontend-only — no backend to deploy.

> **Status:** Pre-1.0. Active scaffolding. The single-file prototype is
> still in `src/App.tsx` while the structural refactor lands across Lanes 2-5.
> Roadmap is tracked in commit history; `CHANGELOG.md` reflects shipped work.

## Highlights

- **Mock-but-typed payments + email.** `PaymentProvider` and `EmailProvider`
  TypeScript interfaces with mock implementations that simulate the full
  Stripe Checkout lifecycle (session create → hosted checkout page →
  webhook → status flip) and email-send-with-preview. Wire-up notes for
  production live in [`docs/integrations/stripe.md`](docs/integrations/stripe.md).
- **Regional data overrides without secrets in source.** Hardcoded national
  defaults work out of the box. Drop in an optional `src/data/local.ts` to
  layer your real county pricing, market rates, demo project list, and
  branding — the file is gitignored. See
  [`docs/architecture.md`](docs/architecture.md) §Data Layer.
- **Frontend-only by design.** React 19 + Vite + TypeScript, persists to
  `localStorage`, deploys as a static bundle. Apache 2.0.

## Screenshots

_Lane 5 fills these in once the refactor + adapter wiring lands._

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser SPA (React 19 + Vite)                               │
│  ├── Screens: Dashboard, NewEstimate, ProjectDetail,         │
│  │            FinalInvoice, MockCheckout                     │
│  ├── Adapter layer: PaymentProvider, EmailProvider           │
│  │   └── Mock implementations (production wire-up = swap     │
│  │       the implementation behind the same interface)       │
│  ├── Data layer: hardcoded defaults + optional local.ts      │
│  └── Persistence: localStorage (versioned schema)            │
└──────────────────────────────────────────────────────────────┘
```

Full design + decisions: [`docs/architecture.md`](docs/architecture.md).

## Quick Start

```bash
git clone https://github.com/Rsan0948/fencepro.git
cd fencepro
npm install
npm run dev
```

Dev server runs on http://localhost:3001.

## Customizing data

FencePro ships with system defaults that work without setup. To layer your
own regional pricing, county list, branding, or demo project data, create
`src/data/local.ts` — it's gitignored and takes precedence over the
defaults. The data contract lives at `src/data/types.ts` (lands in Lane 2).

## Scripts

| Command                 | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Start the Vite dev server on :3001                     |
| `npm run build`         | Type-check then produce a production bundle in `dist/` |
| `npm run preview`       | Preview the production build locally                   |
| `npm run lint`          | ESLint on the project                                  |
| `npm run format`        | Prettier write across all files                        |
| `npm run format:check`  | Prettier check (no write)                              |
| `npm run typecheck`     | `tsc -b --noEmit` on all TypeScript                    |
| `npm test`              | Vitest, single run                                     |
| `npm run test:watch`    | Vitest in watch mode                                   |
| `npm run test:coverage` | Vitest with v8 coverage                                |

## Tech stack

React 19, Vite 7, TypeScript 5.9, Vitest 2, React Testing Library 16,
ESLint 9 (flat config), Prettier 3.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Bugs and security issues:
[`SECURITY.md`](SECURITY.md).

## License

Apache 2.0 — see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
