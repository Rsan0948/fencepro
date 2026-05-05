import { describe, expect, it, vi } from "vitest";
import { MockEmailProvider } from "../../../src/services/email/mock-email";
import type { EmailSendInput } from "../../../src/services/email/types";

function makeInput(overrides: Partial<EmailSendInput> = {}): EmailSendInput {
  return {
    to: "client@example.com",
    from: { email: "noreply@fencepro.demo", name: "FencePro" },
    subject: "Your estimate from FencePro",
    html: "<p>Hello, <strong>client</strong>!</p>",
    text: "Hello, client!",
    metadata: { projectId: "p_test", kind: "estimate" },
    ...overrides,
  };
}

describe("MockEmailProvider", () => {
  it("send queues a message and returns an id", async () => {
    const provider = new MockEmailProvider({ delayMs: 0 });
    const result = await provider.send(makeInput());
    expect(result.id).toMatch(/^msg_mock_/);
    expect(result.queued).toBe(true);
    expect(provider.list()).toHaveLength(1);
  });

  it("get(id) returns the message with html preserved", async () => {
    const provider = new MockEmailProvider({ delayMs: 0 });
    const html = "<a href=\"/checkout/cs_mock_xyz\">Pay deposit</a>";
    const result = await provider.send(makeInput({ html }));
    const stored = provider.get(result.id);
    expect(stored).not.toBeNull();
    expect(stored?.html).toBe(html);
    expect(stored?.subject).toBe("Your estimate from FencePro");
    expect(stored?.to).toBe("client@example.com");
  });

  it("subscribers receive every sent message", async () => {
    const provider = new MockEmailProvider({ delayMs: 0 });
    const listener = vi.fn();
    const unsubscribe = provider.subscribe(listener);
    await provider.send(makeInput({ subject: "first" }));
    await provider.send(makeInput({ subject: "second" }));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0][0].subject).toBe("first");
    expect(listener.mock.calls[1][0].subject).toBe("second");
    unsubscribe();
    await provider.send(makeInput({ subject: "after-unsub" }));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
