export type PaymentSessionType = "deposit" | "final";

export type PaymentSessionStatus = "pending" | "paid" | "expired";

export interface CreateCheckoutSessionInput {
  amount: number;
  currency: "usd";
  description: string;
  customerEmail: string;
  metadata: { projectId: string; type: PaymentSessionType };
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionRef {
  id: string;
  url: string;
}

export interface PaymentSession {
  id: string;
  status: PaymentSessionStatus;
  amountPaid: number;
  paidAt?: string;
}

export interface PaymentProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionRef>;
  getSession(id: string): Promise<PaymentSession>;
}

export type PaymentWebhookHandler = (sessionId: string) => void;

export interface MockSessionRecord {
  id: string;
  input: CreateCheckoutSessionInput;
  status: PaymentSessionStatus;
  amountPaid: number;
  paidAt?: string;
  createdAt: string;
}
