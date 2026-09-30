import { MockStripeProvider } from "../src/services/payments/mock-stripe";

const provider = new MockStripeProvider({ delayMs: 0 });
const session = await provider.createCheckoutSession({
  amount: 1000,
  currency: "usd",
  description: "repro",
  customerEmail: "a@b.c",
  metadata: {},
  successUrl: "http://x/",
  cancelUrl: "http://x/",
});

const calls: string[] = [];
provider.registerWebhook(() => {
  throw new Error("handler A exploded");
});
provider.registerWebhook((id: string) => {
  calls.push(id);
});

try {
  await provider.markPaid(session.id);
} catch {
  // markPaid rejecting is part of the bug; what matters is whether handler B ran
}

if (calls.length === 0) {
  console.log("REPRODUCED: throwing handler A prevented handler B from running");
  process.exit(1);
}
console.log("CLEAN: all webhook handlers ran despite handler A throwing");
