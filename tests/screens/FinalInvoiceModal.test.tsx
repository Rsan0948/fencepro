import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FinalInvoiceModal } from "../../src/screens/FinalInvoiceModal";
import type { Project } from "../../src/types";

const PROJECT: Project = {
  id: "p1",
  client: "Test Client",
  clientEmail: "client@example.com",
  county: "Central",
  fenceType: "wood_privacy",
  linearFeet: 100,
  heightFt: 6,
  materialCost: 1000,
  laborCost: 500,
  totalCost: 1500,
  depositRate: 0.4,
  depositPaid: 600,
  finalPrice: 1800,
  status: "active",
  createdAt: "2026-01-01",
  paidAt: null,
  adjustments: [],
  notes: "",
};

describe("FinalInvoiceModal close paths", () => {
  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<FinalInvoiceModal project={PROJECT} onClose={onClose} onSend={vi.fn()} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FinalInvoiceModal project={PROJECT} onClose={onClose} onSend={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: /final invoice/i });
    const backdrop = dialog.parentElement;
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      await user.click(backdrop);
    }
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when the inner card is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FinalInvoiceModal project={PROJECT} onClose={onClose} onSend={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: /final invoice/i });
    await user.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });
});
