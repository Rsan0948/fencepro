import type {
  EmailProvider,
  EmailSendInput,
  EmailSendResult,
  MockEmailMessage,
} from "./types";

const DEFAULT_DELAY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function generateMessageId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36);
  return `msg_mock_${stamp}${random}`;
}

export interface MockEmailOptions {
  delayMs?: number;
}

export class MockEmailProvider implements EmailProvider {
  private readonly messages: MockEmailMessage[] = [];
  private readonly listeners = new Set<(message: MockEmailMessage) => void>();
  private readonly delayMs: number;

  constructor(options: MockEmailOptions = {}) {
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async send(input: EmailSendInput): Promise<EmailSendResult> {
    if (this.delayMs > 0) {
      await delay(this.delayMs);
    }
    const id = generateMessageId();
    const message: MockEmailMessage = {
      id,
      to: input.to,
      from: input.from,
      subject: input.subject,
      html: input.html,
      text: input.text,
      metadata: input.metadata,
      sentAt: new Date().toISOString(),
    };
    this.messages.push(message);
    console.log("[mock-email]", { to: message.to, subject: message.subject, id });
    for (const listener of this.listeners) {
      listener(message);
    }
    return { id, queued: true };
  }

  list(): MockEmailMessage[] {
    return [...this.messages];
  }

  get(id: string): MockEmailMessage | null {
    return this.messages.find((m) => m.id === id) ?? null;
  }

  subscribe(listener: (message: MockEmailMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
