import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "../../src/screens/Dashboard";
import type { Project } from "../../src/types";

const CURRENT_YEAR = new Date().getFullYear();

function makeProject(overrides: Partial<Project> = {}): Project {
  const base: Project = {
    id: "p_test",
    client: "Test Client",
    county: "Central",
    fenceType: "wood_privacy",
    linearFeet: 100,
    heightFt: 6,
    materialCost: 1000,
    laborCost: 500,
    totalCost: 1500,
    depositRate: 0.4,
    depositPaid: 0,
    finalPrice: 2000,
    status: "pending",
    createdAt: `${CURRENT_YEAR}-02-15`,
    paidAt: null,
    adjustments: [],
    notes: "",
  };
  return { ...base, ...overrides };
}

function renderDashboard(
  projects: Project[],
  handlers: Partial<{
    onProjectClick: (p: Project) => void;
    onNewEstimate: () => void;
  }> = {},
) {
  return render(
    <MemoryRouter>
      <Dashboard
        projects={projects}
        onProjectClick={handlers.onProjectClick ?? (() => {})}
        onNewEstimate={handlers.onNewEstimate ?? (() => {})}
      />
    </MemoryRouter>,
  );
}

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches,
      media: "(max-width: 768px)",
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    })) as unknown as typeof window.matchMedia,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Dashboard", () => {
  it("renders a row for each YTD project", () => {
    renderDashboard([
      makeProject({ id: "p1", client: "Alice Co" }),
      makeProject({ id: "p2", client: "Bravo LLC" }),
    ]);
    expect(screen.getByText("Alice Co")).toBeInTheDocument();
    expect(screen.getByText("Bravo LLC")).toBeInTheDocument();
  });

  it("filters out projects from prior years", () => {
    renderDashboard([
      makeProject({ id: "p_old", client: "Last Year Co", createdAt: "2020-06-01" }),
      makeProject({ id: "p_new", client: "This Year Co" }),
    ]);
    expect(screen.queryByText("Last Year Co")).not.toBeInTheDocument();
    expect(screen.getByText("This Year Co")).toBeInTheDocument();
  });

  it("reports the correct YTD job count next to the projects table", () => {
    renderDashboard([
      makeProject({ id: "a", status: "paid", finalPrice: 1000 }),
      makeProject({ id: "b", status: "active", finalPrice: 2000 }),
      makeProject({ id: "c", status: "pending", finalPrice: 3000 }),
    ]);
    expect(screen.getByText(/3 jobs/i)).toBeInTheDocument();
  });

  it("renders the (demo) Simulate client payment link only on rows with checkoutUrl", () => {
    renderDashboard([
      makeProject({ id: "p_with", client: "Has Checkout", checkoutUrl: "/checkout/cs_mock_x" }),
      makeProject({ id: "p_without", client: "No Checkout" }),
    ]);
    const links = screen.getAllByRole("link", { name: /simulate payment/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/checkout/cs_mock_x");
  });

  it("invokes onProjectClick when a row is clicked", async () => {
    const user = userEvent.setup();
    const onProjectClick = vi.fn();
    renderDashboard([makeProject({ id: "p_click", client: "Clickable Co" })], { onProjectClick });
    await user.click(screen.getByText("Clickable Co"));
    expect(onProjectClick).toHaveBeenCalledTimes(1);
    expect(onProjectClick.mock.calls[0][0].id).toBe("p_click");
  });

  it("invokes onNewEstimate when the + New Estimate button is clicked", async () => {
    const user = userEvent.setup();
    const onNewEstimate = vi.fn();
    renderDashboard([], { onNewEstimate });
    await user.click(screen.getByRole("button", { name: /\+ new estimate/i }));
    expect(onNewEstimate).toHaveBeenCalledTimes(1);
  });

  it("renders the DefaultsBanner above the dashboard header", () => {
    renderDashboard([]);
    expect(screen.getByText("DEFAULTS")).toBeInTheDocument();
  });

  it("hides the desktop column-header strip on mobile", () => {
    stubMatchMedia(true);
    renderDashboard([makeProject({ client: "Mobile Client" })]);
    // the desktop strip renders a single "Client" / "Type" / "Amount" / "Status" / "Date" header row
    expect(screen.queryByText("Client")).not.toBeInTheDocument();
    expect(screen.queryByText("Amount")).not.toBeInTheDocument();
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
  });

  it("renders the simulate-payment link as a 44px button on mobile", () => {
    stubMatchMedia(true);
    renderDashboard([
      makeProject({
        id: "p_with",
        client: "Has Checkout",
        checkoutUrl: "/checkout/cs_mock_x",
      }),
    ]);
    const link = screen.getByRole("link", { name: /simulate payment/i });
    const inlineStyle = link.getAttribute("style") ?? "";
    expect(inlineStyle).toMatch(/min-height:\s*44px/);
    expect(inlineStyle).toMatch(/justify-content:\s*center/);
  });
});
