import { describe, expect, it } from "vitest";
import { fenceLabel, fmt, fmtD, parseISODateLocal, todayISO } from "../../src/lib/format";
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

  it("renders the calendar day as written, independent of timezone", () => {
    // `new Date("2026-02-14")` parses as UTC midnight, which is Feb 13 in any
    // timezone west of UTC; local parsing must always render the 14th.
    expect(fmtD("2026-02-14")).toBe("Feb 14, 2026");
  });

  it("returns the raw string when the date is unparseable", () => {
    expect(fmtD("not-a-date")).toBe("not-a-date");
  });
});

describe("parseISODateLocal", () => {
  it("parses date-only strings as local time", () => {
    const d = parseISODateLocal("2026-02-14");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(14);
    expect(d.getHours()).toBe(0);
  });

  it("falls back to Date parsing for non-date-only strings", () => {
    const d = parseISODateLocal("2026-02-14T10:30:00.000Z");
    expect(d.getTime()).toBe(new Date("2026-02-14T10:30:00.000Z").getTime());
  });
});

describe("todayISO", () => {
  it("returns the local calendar date in YYYY-MM-DD form", () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    expect(todayISO()).toBe(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    );
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
