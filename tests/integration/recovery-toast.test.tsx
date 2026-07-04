import { render, screen } from "@testing-library/react";
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

describe("integration: corrupted-storage recovery toast", () => {
  beforeEach(() => {
    storageBacking = new Map<string, string>();
    storageBacking.set("fencepro:projects:v1", "{corrupt-json");
    vi.stubGlobal("localStorage", fakeStorage);
    vi.spyOn(console, "log").mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("surfaces the recovery info toast when saved data is unreadable", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/saved data was unreadable/i)).toBeInTheDocument();
  });
});
