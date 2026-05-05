import { MockEmailProvider } from "./mock-email";
import type { EmailProvider, MockEmailMessage } from "./types";

const isTestEnv = import.meta.env.MODE === "test";
const mock = new MockEmailProvider(isTestEnv ? { delayMs: 0 } : {});

export const emailProvider: EmailProvider = mock;

export function listEmails(): MockEmailMessage[] {
  return mock.list();
}

export function getEmail(id: string): MockEmailMessage | null {
  return mock.get(id);
}

export function subscribeToEmails(handler: (message: MockEmailMessage) => void): () => void {
  return mock.subscribe(handler);
}

export { renderEstimateSent, renderFinalInvoice, renderPaymentReceipt } from "./templates";

export type {
  EstimateSentInput,
  FinalInvoiceInput,
  PaymentReceiptInput,
  RenderedEmail,
} from "./templates";

export type {
  EmailFromAddress,
  EmailKind,
  EmailProvider,
  EmailSendInput,
  EmailSendResult,
  MockEmailMessage,
} from "./types";
