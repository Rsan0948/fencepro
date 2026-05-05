# Email Integration

> **Status:** Mock-only by design. Same shape as
> [`stripe.md`](stripe.md) — interface contract, mock behavior,
> production wire-up notes.

## Why mocked, not wired

Real transactional email (Resend, Postmark, SendGrid, Mailgun, SES) requires:

- A provider account + API key
- A backend to hold the key (can't live in a browser bundle)
- DNS records (SPF, DKIM, DMARC) for deliverability
- Bounce + complaint handling

All belong in production infra. FencePro ships the interface, a mock that
shows what the customer-facing email looks like, and the contract for
swapping in a real provider.

## Interface contract

_Lane 3 ships the typed implementation. Design target:_

```ts
interface EmailProvider {
  send(input: {
    to: string;
    from: { email: string; name: string };
    subject: string;
    html: string;
    text?: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; queued: true }>;
}
```

## Mock implementation

`MockEmailProvider` (in `src/services/email/mock-email.ts`):

- `send` logs the message to console with a structured envelope
- Triggers an in-app toast: _"(demo) Email sent to X — click to preview"_
- Toast click opens a modal rendering the actual HTML email so you can
  see exactly what the client would receive
- This is genuinely useful — most invoice apps' OSS demos don't expose the
  email surface at all

## Wiring real email (Resend example)

Resend has the cleanest dev story. The setup:

1. Create a Resend account, verify a sending domain, generate an API key.
2. Stand up a backend (same one you'd use for Stripe).
3. Implement `ResendEmailProvider`:

   ```ts
   import { Resend } from "resend";

   class ResendEmailProvider implements EmailProvider {
     private client: Resend;
     constructor(apiKey: string) {
       this.client = new Resend(apiKey);
     }

     async send(input) {
       const { data, error } = await this.client.emails.send({
         from: `${input.from.name} <${input.from.email}>`,
         to: input.to,
         subject: input.subject,
         html: input.html,
         text: input.text,
       });
       if (error) throw new Error(error.message);
       return { id: data!.id, queued: true };
     }
   }
   ```

4. Frontend calls `/api/email/send`, backend invokes `ResendEmailProvider`.
5. Swap the import in `src/services/email/index.ts`.

## What FencePro will not do

- Store or transmit email-provider API keys
- Provide a backend
- Handle bounces, complaints, or unsubscribes

The mock + preview modal is for demos and development. Do not deploy the
mock to a public surface where users might think their email actually sent.
