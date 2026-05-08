---
title: FencePro
emoji: 🪵
colorFrom: yellow
colorTo: gray
sdk: static
pinned: false
license: apache-2.0
---

# FencePro

A frontend-only template for fence contractors: dashboard, chat-driven
estimates, project lifecycle, and a fully-typed mock of Stripe checkout +
transactional email. Static SPA, mobile-responsive.

This Space hosts the live demo. Source, architecture notes, and the
adapter-pattern integration contracts live on GitHub at
[github.com/Rsan0948/fencepro](https://github.com/Rsan0948/fencepro). The
demo runs entirely in the browser — no card is collected, no real money
moves. State persists to the visitor's `localStorage`, scoped to a
single `fencepro:projects:v1` key.

The mocked Stripe checkout and transactional-email surfaces ship behind
typed `PaymentProvider` and `EmailProvider` interfaces; the production
wire-up surface is documented in
`docs/integrations/{stripe,email}.md` on GitHub but not built. FencePro
is a portfolio reference for the adapter pattern + interface-driven
services architecture, not a deployable contractor backend.
