import type {
  CheckoutSessionRef,
  CreateCheckoutSessionInput,
  MockSessionRecord,
  PaymentProvider,
  PaymentSession,
  PaymentWebhookHandler,
} from "./types";

const DEFAULT_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function generateSessionId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36);
  return `cs_mock_${stamp}${random}`;
}

export interface MockStripeOptions {
  delayMs?: number;
}

export class MockStripeProvider implements PaymentProvider {
  private readonly sessions = new Map<string, MockSessionRecord>();
  private readonly webhookHandlers = new Set<PaymentWebhookHandler>();
  private readonly delayMs: number;

  constructor(options: MockStripeOptions = {}) {
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionRef> {
    if (this.delayMs > 0) {
      await delay(this.delayMs);
    }
    const id = generateSessionId();
    this.sessions.set(id, {
      id,
      input,
      status: "pending",
      amountPaid: 0,
      createdAt: new Date().toISOString(),
    });
    return { id, url: `/checkout/${id}` };
  }

  async getSession(id: string): Promise<PaymentSession> {
    const record = this.sessions.get(id);
    if (!record) {
      return { id, status: "expired", amountPaid: 0 };
    }
    return {
      id: record.id,
      status: record.status,
      amountPaid: record.amountPaid,
      paidAt: record.paidAt,
    };
  }

  getRecord(id: string): MockSessionRecord | null {
    return this.sessions.get(id) ?? null;
  }

  async markPaid(id: string): Promise<void> {
    const record = this.sessions.get(id);
    if (!record || record.status === "paid") return;
    record.status = "paid";
    record.amountPaid = record.input.amount;
    record.paidAt = new Date().toISOString();
    for (const handler of this.webhookHandlers) {
      handler(id);
    }
  }

  registerWebhook(handler: PaymentWebhookHandler): () => void {
    this.webhookHandlers.add(handler);
    return () => {
      this.webhookHandlers.delete(handler);
    };
  }
}
