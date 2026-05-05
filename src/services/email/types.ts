export type EmailKind = "estimate" | "final-invoice" | "payment-receipt";

export interface EmailFromAddress {
  email: string;
  name: string;
}

export interface EmailSendInput {
  to: string;
  from: EmailFromAddress;
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, string>;
}

export interface EmailSendResult {
  id: string;
  queued: true;
}

export interface EmailProvider {
  send(input: EmailSendInput): Promise<EmailSendResult>;
}

export interface MockEmailMessage {
  id: string;
  to: string;
  from: EmailFromAddress;
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, string>;
  sentAt: string;
}
