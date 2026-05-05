import { describe, expect, it, vi } from "vitest";
import { MockStripeProvider } from "../../../src/services/payments/mock-stripe";
import type { CreateCheckoutSessionInput } from "../../../src/services/payments/types";

function makeInput(
  overrides: Partial<CreateCheckoutSessionInput> = {},
): CreateCheckoutSessionInput {
  return {
    amount: 1500,
    currency: "usd",
    description: "Deposit for Test Client",
    customerEmail: "client@example.com",
    metadata: { projectId: "p_test", type: "deposit" },
    successUrl: "http://localhost/",
    cancelUrl: "http://localhost/",
    ...overrides,
  };
}

describe("MockStripeProvider", () => {
  it("createCheckoutSession returns id and matching /checkout/<id> url", async () => {
    const provider = new MockStripeProvider({ delayMs: 0 });
    const ref = await provider.createCheckoutSession(makeInput());
    expect(ref.id).toMatch(/^cs_mock_/);
    expect(ref.url).toBe(`/checkout/${ref.id}`);
  });

  it("getSession round-trips a freshly created session as pending", async () => {
    const provider = new MockStripeProvider({ delayMs: 0 });
    const ref = await provider.createCheckoutSession(makeInput());
    const session = await provider.getSession(ref.id);
    expect(session.id).toBe(ref.id);
    expect(session.status).toBe("pending");
    expect(session.amountPaid).toBe(0);
  });

  it("getSession reports expired for unknown ids", async () => {
    const provider = new MockStripeProvider({ delayMs: 0 });
    const session = await provider.getSession("cs_mock_does_not_exist");
    expect(session.status).toBe("expired");
  });

  it("markPaid flips the session and fires every registered webhook", async () => {
    const provider = new MockStripeProvider({ delayMs: 0 });
    const ref = await provider.createCheckoutSession(makeInput({ amount: 2400 }));
    const handler = vi.fn();
    provider.registerWebhook(handler);
    await provider.markPaid(ref.id);
    const after = await provider.getSession(ref.id);
    expect(after.status).toBe("paid");
    expect(after.amountPaid).toBe(2400);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(ref.id);
  });

  it("markPaid is idempotent and does not double-fire webhooks", async () => {
    const provider = new MockStripeProvider({ delayMs: 0 });
    const ref = await provider.createCheckoutSession(makeInput());
    const handler = vi.fn();
    provider.registerWebhook(handler);
    await provider.markPaid(ref.id);
    await provider.markPaid(ref.id);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("getRecord exposes the original input for the mock checkout page", async () => {
    const provider = new MockStripeProvider({ delayMs: 0 });
    const input = makeInput({ amount: 999, description: "Final balance for X" });
    const ref = await provider.createCheckoutSession(input);
    const record = provider.getRecord(ref.id);
    expect(record).not.toBeNull();
    expect(record?.input.amount).toBe(999);
    expect(record?.input.description).toBe("Final balance for X");
    expect(record?.input.metadata.type).toBe("deposit");
  });
});
