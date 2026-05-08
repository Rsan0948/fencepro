import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "../../src/lib/useIsMobile";

type ChangeListener = (event: MediaQueryListEvent) => void;

let currentMatches = false;
let listeners: ChangeListener[] = [];

function makeMediaQueryList(): MediaQueryList {
  return {
    get matches() {
      return currentMatches;
    },
    media: "(max-width: 768px)",
    onchange: null,
    addEventListener: ((_type: string, listener: ChangeListener) => {
      listeners.push(listener);
    }) as MediaQueryList["addEventListener"],
    removeEventListener: ((_type: string, listener: ChangeListener) => {
      listeners = listeners.filter((l) => l !== listener);
    }) as MediaQueryList["removeEventListener"],
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  } as MediaQueryList;
}

beforeEach(() => {
  currentMatches = false;
  listeners = [];
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => makeMediaQueryList()),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useIsMobile", () => {
  it("returns false when matchMedia reports a desktop width", () => {
    currentMatches = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true when matchMedia matches the mobile breakpoint", () => {
    currentMatches = true;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("updates when the matchMedia change event fires", () => {
    currentMatches = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      const event = { matches: true } as MediaQueryListEvent;
      for (const listener of listeners) listener(event);
    });
    expect(result.current).toBe(true);
  });

  it("removes its change listener on unmount", () => {
    const { unmount } = renderHook(() => useIsMobile());
    expect(listeners.length).toBe(1);
    unmount();
    expect(listeners.length).toBe(0);
  });
});
