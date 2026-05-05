import { describe, expect, it } from "vitest";
import { fenceLabel, fmt, fmtD } from "../../src/lib/format";
import type { FenceType } from "../../src/types";

const FENCES: FenceType[] = [
  { id: "wood_privacy", label: "Wood Privacy", icon: "P", desc: "" },
  { id: "vinyl", label: "Vinyl", icon: "V", desc: "" },
];

describe("fmt", () => {
  it("formats round dollars with no fractional digits", () => {
    expect(fmt(1234)).toBe("$1,234");
  });

  it("rounds half-cent values to whole dollars", () => {
    expect(fmt(1234.5)).toMatch(/^\$1,23[45]$/);
  });

  it("handles zero", () => {
    expect(fmt(0)).toBe("$0");
  });
});

describe("fmtD", () => {
  it("renders an ISO date string in en-US short month form", () => {
    expect(fmtD("2026-02-14")).toMatch(/^Feb\s+\d+,\s+2026$/);
  });
});

describe("fenceLabel", () => {
  it("returns the label for a known id", () => {
    expect(fenceLabel("wood_privacy", FENCES)).toBe("Wood Privacy");
  });

  it("falls back to the raw id when the lookup misses", () => {
    expect(fenceLabel("not_a_real_type", FENCES)).toBe("not_a_real_type");
  });
});
