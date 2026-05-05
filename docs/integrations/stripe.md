# Stripe Integration

> **Status:** Mock-only by design. This document describes the interface
> contract, the mock behavior, and what production wire-up would look like.
> Real Stripe SDK code is intentionally absent.

## Why mocked, not wired

FencePro is a frontend-only template. Real Stripe integration requires:

- A backend to hold `STRIPE_SECRET_KEY` (it cannot live in a browser bundle)
- A public webhook endpoint to receive `checkout.session.completed` events
- Signature verification on every webhook
- Idempotency handling for retried webhooks

All four belong in a backend. FencePro ships the architecturally interesting
piece — the adapter contract and a faithful mock — and leaves the backend
implementation to anyone who wants to take FencePro to production.

## Interface contract

_Lane 3 ships the typed implementation. The signatures below are the design
target; treat as authoritative for the wire-up notes._

```ts
interface PaymentProvider {
  createCheckoutSession(input: {
    amount: number;
    currency: "usd";
    description: string;
    customerEmail: string;
    metadata: { projectId: string; type: "deposit" | "final" };
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ id: string; url: string }>;

  getSession(id: string): Promise<{
    id: string;
    status: "pending" | "paid" | "expired";
    amountPaid: number;
    paidAt?: string;
  }>;
}
```

## Mock implementation

`MockStripeProvider` (in `src/services/payments/mock-stripe.ts`):

- `createCheckoutSession` returns a session ID after a short artificial
  delay; the URL routes to an in-app `/mock-checkout/:id` page that mimics
  the Stripe-hosted checkout layout
- The mock checkout page's "pay" button simulates a payment and fires a
  synthetic webhook handler in-process, flipping the project status

The mock is intentionally faithful enough that the demo lifecycle
(estimate → deposit paid → adjustments → final invoice → final paid) feels
real on a static deploy.

## Wiring real Stripe

When you're ready to take FencePro to production:

1. **Stand up a backend** (any HTTP server — Hono, Express, Cloudflare
   Worker, Vercel function). Secret keys live here.
2. **Implement `RealStripeProvider`** against the same `PaymentProvider`
   interface. `createCheckoutSession` calls your backend, which calls
   `stripe.checkout.sessions.create()` and returns the session URL.
3. **Add a webhook endpoint** at your backend that:
   - Verifies the signature using `stripe.webhooks.constructEvent()` and
     `STRIPE_WEBHOOK_SECRET`
   - Looks up the local project by `metadata.projectId`
   - Updates the project status based on the event type
   - Returns 200 quickly (Stripe retries on non-2xx)
4. **Swap the import** in `src/services/payments/index.ts` from
   `MockStripeProvider` to `RealStripeProvider`. The rest of the app
   doesn't change.

### Idempotency

Stripe retries webhooks. Your handler must be idempotent — handle the same
event ID twice without double-applying state. Easiest: store seen event
IDs in your database and short-circuit duplicates.

### Local development with real Stripe

Use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward
webhooks to your local backend during development:

```bash
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

## What FencePro will not do

- Store or transmit Stripe secret keys
- Provide a backend (you build it)
- Verify webhook signatures (your backend does)

The mock implementation is for demos and development. Do not deploy the
mock to a public surface where customers might mistake `/mock-checkout`
for a real payment flow.
