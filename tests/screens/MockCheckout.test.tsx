import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { MockCheckout } from "../../src/screens/MockCheckout";
import { paymentProvider, registerPaymentWebhook } from "../../src/services/payments";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/checkout/:sessionId" element={<MockCheckout />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function seedSession(amount = 1500, type: "deposit" | "final" = "deposit") {
  return paymentProvider.createCheckoutSession({
    amount,
    currency: "usd",
    description: type === "deposit" ? "Deposit for Test Client" : "Final balance for Test Client",
    customerEmail: "client@example.com",
    metadata: { projectId: "p_test", type },
    successUrl: "http://localhost/",
    cancelUrl: "http://localhost/",
  });
}

describe("MockCheckout", () => {
  it("renders the session amount, description, and customer email", async () => {
    const ref = await seedSession(2400);
    renderAt(ref.url);
    expect(screen.getByText("Deposit for Test Client")).toBeInTheDocument();
    expect(screen.getByText("client@example.com")).toBeInTheDocument();
    expect(screen.getByText("p_test")).toBeInTheDocument();
    expect(screen.getByText("$2,400")).toBeInTheDocument();
  });

  it("shows an Awaiting payment status before Pay is clicked", async () => {
    const ref = await seedSession();
    renderAt(ref.url);
    expect(screen.getByText(/awaiting payment/i)).toBeInTheDocument();
  });

  it("clicking Pay marks the session paid, fires the webhook, and navigates home", async () => {
    const user = userEvent.setup();
    const ref = await seedSession(900);
    const handler = vi.fn();
    const unregister = registerPaymentWebhook(handler);
    try {
      renderAt(ref.url);
      await user.click(screen.getByRole("button", { name: /pay \$900/i }));
      await waitFor(() => {
        expect(screen.getByText("HOME")).toBeInTheDocument();
      });
      expect(handler).toHaveBeenCalledWith(ref.id);
      const session = await paymentProvider.getSession(ref.id);
      expect(session.status).toBe("paid");
      expect(session.amountPaid).toBe(900);
    } finally {
      unregister();
    }
  });

  it("renders a Payment received panel when the session is already paid", async () => {
    const user = userEvent.setup();
    const ref = await seedSession(450);
    renderAt(ref.url);
    await user.click(screen.getByRole("button", { name: /pay \$450/i }));
    await waitFor(() => {
      expect(screen.getByText("HOME")).toBeInTheDocument();
    });
    renderAt(ref.url);
    expect(await screen.findByText(/payment received/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^pay \$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to fencepro/i })).toBeInTheDocument();
  });

  it("renders the expired panel when the session id is unknown", () => {
    renderAt("/checkout/cs_mock_does_not_exist");
    expect(screen.getByText(/this checkout has expired/i)).toBeInTheDocument();
  });

  it("the expired panel back-link navigates home", async () => {
    const user = userEvent.setup();
    renderAt("/checkout/cs_mock_does_not_exist");
    await user.click(screen.getByRole("button", { name: /back to fencepro/i }));
    await waitFor(() => {
      expect(screen.getByText("HOME")).toBeInTheDocument();
    });
  });

  it("pressing Escape navigates back to the dashboard", async () => {
    const ref = await seedSession(750);
    renderAt(ref.url);
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.getByText("HOME")).toBeInTheDocument();
    });
  });
});
