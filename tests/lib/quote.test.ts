import { describe, expect, it } from "vitest";
import { calcQuote } from "../../src/lib/quote";
import type { QuoteContext } from "../../src/lib/quote";

const ctx: QuoteContext = {
  prices: {
    wood_privacy: {
      "4x4x8 Post": 15,
      "2x4x8 Rail": 8,
      "1x6x6 Board": 4,
      "80lb Concrete": 5,
    },
    split_rail: { "4x4x8 Post": 15, "Split Rail 8ft": 10, "80lb Concrete": 5 },
    chain_link: { "Line Post": 18, "Chain Link 50ft": 90, "Tension Wire": 13 },
    vinyl: { "Vinyl Post": 28, "Vinyl Panel 6ft": 65, "Post Cap": 4 },
    wood_picket: {
      "4x4x8 Post": 15,
      "2x4x8 Rail": 8,
      "Picket 4ft": 2,
      "80lb Concrete": 5,
    },
    ornamental: { "Orn Post": 42, "Orn Panel 4ft": 90, "80lb Concrete": 5 },
  },
  countyRates: {
    default: { low: 24, high: 38 },
    Central: { low: 24, high: 38 },
    Premium: { low: 50, high: 80 },
  },
};

describe("calcQuote", () => {
  it("uses the selected county's rates for market low/high", () => {
    const q = calcQuote(
      {
        fenceType: "wood_privacy",
        linearFeet: 100,
        heightFt: 6,
        employees: 2,
        hourlyWage: 22,
        county: "Premium",
      },
      ctx,
    );

    expect(q.marketLow).toBe(50 * 100);
    expect(q.marketHigh).toBe(80 * 100);
  });

  it("falls back to the default rate when the county is unknown", () => {
    const q = calcQuote(
      {
        fenceType: "wood_privacy",
        linearFeet: 50,
        heightFt: 6,
        employees: 1,
        hourlyWage: 20,
        county: "Atlantis",
      },
      ctx,
    );

    expect(q.marketLow).toBe(24 * 50);
    expect(q.marketHigh).toBe(38 * 50);
  });

  it("ignores the prototype's linearFeet>200 heuristic for county lookup", () => {
    const small = calcQuote(
      {
        fenceType: "wood_privacy",
        linearFeet: 50,
        heightFt: 6,
        employees: 1,
        hourlyWage: 20,
        county: "Premium",
      },
      ctx,
    );
    const large = calcQuote(
      {
        fenceType: "wood_privacy",
        linearFeet: 500,
        heightFt: 6,
        employees: 1,
        hourlyWage: 20,
        county: "Premium",
      },
      ctx,
    );

    expect(small.marketLow / 50).toBe(50);
    expect(large.marketLow / 500).toBe(50);
  });

  it("returns a populated breakdown with positive material cost for non-privacy types", () => {
    const q = calcQuote(
      {
        fenceType: "chain_link",
        linearFeet: 80,
        heightFt: 5,
        employees: 2,
        hourlyWage: 22,
        county: "Central",
      },
      ctx,
    );

    expect(q.breakdown.length).toBeGreaterThan(0);
    expect(q.materialCost).toBeGreaterThan(0);
    expect(q.totalCost).toBe(q.materialCost + q.laborCost);
  });
});
