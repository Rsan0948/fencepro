import { MockStripeProvider } from "./mock-stripe";
import type { MockSessionRecord, PaymentProvider, PaymentWebhookHandler } from "./types";

const mock = new MockStripeProvider();

export const paymentProvider: PaymentProvider = mock;

export function getMockSessionRecord(id: string): MockSessionRecord | null {
  return mock.getRecord(id);
}

export async function markSessionPaid(id: string): Promise<void> {
  await mock.markPaid(id);
}

export function registerPaymentWebhook(handler: PaymentWebhookHandler): () => void {
  return mock.registerWebhook(handler);
}

export type {
  CheckoutSessionRef,
  CreateCheckoutSessionInput,
  MockSessionRecord,
  PaymentProvider,
  PaymentSession,
  PaymentSessionStatus,
  PaymentSessionType,
  PaymentWebhookHandler,
} from "./types";
