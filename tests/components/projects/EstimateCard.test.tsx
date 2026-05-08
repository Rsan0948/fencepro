import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EstimateCard } from "../../../src/components/projects/EstimateCard";
import type { EstimateAnswers, FenceType, Quote } from "../../../src/types";

const FENCE: FenceType = {
  id: "wood_privacy",
  label: "Wood Privacy",
  icon: "P",
  desc: "",
};

const QUOTE: Quote = {
  materialCost: 400,
  laborCost: 100,
  totalCost: 500,
  breakdown: [{ item: "Posts", qty: 10, unit: 15 }],
  totalHours: 10,
  sections: 5,
  marketLow: 2400,
  marketHigh: 3800,
};

const ANSWERS: EstimateAnswers = {
  county: "Central",
  fenceType: FENCE,
  linearFeet: 100,
  heightFt: 6,
  crew: [{ count: 2, hourlyWage: 22, hours: 40 }],
};

function renderCard(onSave: (payload: unknown) => void = () => {}) {
  return render(<EstimateCard quote={QUOTE} answers={ANSWERS} onSave={onSave} />);
}

describe("EstimateCard", () => {
  it("renders the client name and client email inputs empty by default", () => {
    renderCard();
    expect(screen.getByPlaceholderText(/client name/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/client email/i)).toHaveValue("");
  });

  it("does not invoke onSave when both fields are empty and Send is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderCard(onSave);
    await user.click(screen.getByRole("button", { name: /send estimate/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not invoke onSave when only the client name is filled", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderCard(onSave);
    await user.type(screen.getByPlaceholderText(/client name/i), "Alice Co");
    await user.click(screen.getByRole("button", { name: /send estimate/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("invokes onSave with the typed payload shape when both fields are filled", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderCard(onSave);
    await user.type(screen.getByPlaceholderText(/client name/i), "Alice Co");
    await user.type(screen.getByPlaceholderText(/client email/i), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /send estimate/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload).toMatchObject({
      clientName: "Alice Co",
      clientEmail: "alice@example.com",
      margin: 25,
      answers: ANSWERS,
      quote: QUOTE,
    });
    expect(typeof payload.finalPrice).toBe("number");
    expect(typeof payload.depositAmt).toBe("number");
    expect(typeof payload.depositPct).toBe("number");
    expect(payload.finalPrice).toBeCloseTo(625, 5);
  });

  it("replaces the form with a success card after a valid send", async () => {
    const user = userEvent.setup();
    renderCard(vi.fn());
    await user.type(screen.getByPlaceholderText(/client name/i), "Alice Co");
    await user.type(screen.getByPlaceholderText(/client email/i), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /send estimate/i }));
    expect(screen.queryByPlaceholderText(/client name/i)).not.toBeInTheDocument();
    expect(screen.getByText(/estimate sent to alice@example\.com/i)).toBeInTheDocument();
  });

  it("renders the answers metadata strip in the header", () => {
    renderCard();
    expect(screen.getByText(/Central Co\. · Wood Privacy · 100 lin ft/i)).toBeInTheDocument();
  });

  it("renders the Send button disabled when both fields are empty", () => {
    renderCard();
    const sendBtn = screen.getByRole("button", { name: /send estimate/i });
    expect(sendBtn).toBeDisabled();
  });

  it("keeps Send disabled when only the email is filled", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.type(screen.getByPlaceholderText(/client email/i), "only-email@example.com");
    expect(screen.getByRole("button", { name: /send estimate/i })).toBeDisabled();
  });

  it("enables Send only when both name and email are filled", async () => {
    const user = userEvent.setup();
    renderCard();
    const sendBtn = screen.getByRole("button", { name: /send estimate/i });
    expect(sendBtn).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/client name/i), "Alice Co");
    expect(sendBtn).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/client email/i), "alice@example.com");
    expect(sendBtn).toBeEnabled();
  });
});
