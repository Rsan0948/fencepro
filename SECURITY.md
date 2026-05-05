# Security Policy

## Supported Versions

FencePro is in active development. Only the `main` branch receives security
fixes; there are no LTS releases.

## Reporting a Vulnerability

If you discover a security issue, **do not open a public GitHub issue**.
Email **rubmatsan2001@gmail.com** with:

- A description of the vulnerability
- Steps to reproduce
- Affected versions / commit SHAs
- Any proof-of-concept code

You can expect:

- An acknowledgement within 72 hours
- A triage assessment within 7 days
- A fix or mitigation plan with a target date

## Threat model

FencePro is a frontend-only SPA with optional local data overrides. It does
not include real payment processing or email delivery; the Stripe and email
adapters are mocked in source. Practical implications:

- **No secrets are stored or transmitted by FencePro itself.** If you wire
  in a real provider, the secret-handling responsibility moves to the
  backend you build for that purpose. See `docs/integrations/stripe.md`.
- **All data is local.** Project state lives in `localStorage`. Clearing
  browser storage clears the app.
- **The "mock checkout" page is intentionally fake.** It is not a real
  payment surface and must not be exposed to end customers.

If you're considering a production deployment with real payment processing,
the security review burden is on the integration code you write — FencePro
provides the interface contract, not the production implementation.
