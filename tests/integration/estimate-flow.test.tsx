import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

let storageBacking = new Map<string, string>();
const fakeStorage: Storage = {
  get length() {
    return storageBacking.size;
  },
  clear() {
    storageBacking.clear();
  },
  getItem(key: string) {
    return storageBacking.get(key) ?? null;
  },
  key(index: number) {
    return Array.from(storageBacking.keys())[index] ?? null;
  },
  removeItem(key: string) {
    storageBacking.delete(key);
  },
  setItem(key: string, value: string) {
    storageBacking.set(key, value);
  },
};

function RoutedApp() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );
}

const LONG_WAIT = { timeout: 4000 };

describe("integration: estimate → pay → receipt happy path", () => {
  beforeEach(() => {
    storageBacking = new Map<string, string>();
    vi.stubGlobal("localStorage", fakeStorage);
    vi.spyOn(console, "log").mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it(
    "drives the chat, sends the estimate, pays via mock checkout, and flips status",
    async () => {
      const user = userEvent.setup();
      render(<RoutedApp />);

      // Land on the dashboard, kick off a new estimate.
      await user.click(screen.getByRole("button", { name: /\+ new estimate/i }));

      // Bot greeting takes ~900ms to type.
      await screen.findByText(/hey! let's build/i, undefined, LONG_WAIT);

      // County → fence type → dimensions → crew.
      await user.click(await screen.findByRole("button", { name: /^central county$/i }));
      await user.click(
        await screen.findByRole("button", { name: /wood privacy/i }, LONG_WAIT),
      );
      await user.click(
        await screen.findByRole("button", { name: /confirm: 100 ft x 6 ft tall/i }, LONG_WAIT),
      );
      await user.click(
        await screen.findByRole("button", { name: /confirm: 2 workers @ \$22\/hr/i }, LONG_WAIT),
      );

      // The estimate card resolves ~1.2s after the last confirm. Wait on the
      // form input directly — the bot message also contains "your estimate"
      // so that text alone isn't a reliable card-mounted signal.
      const nameInput = await screen.findByPlaceholderText(
        /^client name$/i,
        undefined,
        LONG_WAIT,
      );

      // Send the estimate.
      await user.type(nameInput, "Integration Test Client");
      await user.type(
        screen.getByPlaceholderText(/^client email$/i),
        "integration@test.example",
      );
      await user.click(screen.getByRole("button", { name: /send estimate/i }));

      // Toast surfaces the queued estimate email.
      const estimateToast = await screen.findByText(
        /your estimate from acme fence co/i,
        undefined,
        LONG_WAIT,
      );

      // Click the toast → preview modal opens with the Pay deposit link.
      await user.click(estimateToast);
      await screen.findByText(/email preview/i);
      const payLink = screen.getByRole("link", { name: /pay deposit/i });
      expect(payLink).toHaveAttribute(
        "href",
        expect.stringMatching(/\/checkout\/cs_mock_/),
      );

      // Close preview and head back to the dashboard via the topbar nav.
      // NavItem renders icon + label inline so the button's accessible name is
      // the concatenation (e.g. "DSHDASH"); match the label as a substring.
      await user.click(screen.getByRole("button", { name: /close preview/i }));
      await user.click(screen.getByRole("button", { name: /dash/i }));

      const simulateLink = await screen.findByRole(
        "link",
        { name: /simulate payment/i },
        LONG_WAIT,
      );
      await user.click(simulateLink);

      // Now on MockCheckout — pay.
      await screen.findByText(/hosted checkout/i);
      await user.click(screen.getByRole("button", { name: /^pay /i }));

      // Back on the dashboard, the project is now active.
      await waitFor(
        () => {
          expect(screen.getByText("Integration Test Client")).toBeInTheDocument();
        },
        LONG_WAIT,
      );
      // The Active label appears both as the project's status badge and in
      // the donut card's "Active (1)" summary, so allow multiple matches.
      expect(screen.getAllByText(/^active$/i).length).toBeGreaterThanOrEqual(1);

      // The receipt toast confirms the payment-receipt email went out.
      await screen.findByText(/receipt: deposit from acme/i, undefined, LONG_WAIT);
    },
    20000,
  );
});
