import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ isLocalLoaded: false }));

vi.mock("../../../src/data", () => ({
  get isLocalLoaded() {
    return state.isLocalLoaded;
  },
}));

import { DefaultsBanner } from "../../../src/components/system/DefaultsBanner";

beforeEach(() => {
  state.isLocalLoaded = false;
});

describe("DefaultsBanner", () => {
  it("renders the banner when local data is not loaded", () => {
    state.isLocalLoaded = false;
    render(<DefaultsBanner />);
    expect(screen.getByText("DEFAULTS")).toBeInTheDocument();
  });

  it("returns null when a local override is loaded", () => {
    state.isLocalLoaded = true;
    const { container } = render(<DefaultsBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("points contributors at src/data/local.ts", () => {
    state.isLocalLoaded = false;
    render(<DefaultsBanner />);
    expect(screen.getByText(/drop in src\/data\/local\.ts to customize/i)).toBeInTheDocument();
  });

  it("references the architecture data layer section", () => {
    state.isLocalLoaded = false;
    render(<DefaultsBanner />);
    expect(screen.getByText(/docs\/architecture\.md/i)).toBeInTheDocument();
  });

  it("includes the running-with-default-data copy", () => {
    state.isLocalLoaded = false;
    render(<DefaultsBanner />);
    expect(screen.getByText(/running with default data/i)).toBeInTheDocument();
  });
});
