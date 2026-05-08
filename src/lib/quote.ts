import { data as defaultData } from "../data";
import type { LocalData } from "../data/types";
import type { BreakdownItem, CrewMember, FenceTypeId, Quote } from "../types";

export interface CalcQuoteInput {
  fenceType: FenceTypeId;
  linearFeet: number;
  heightFt: number;
  crew: CrewMember[];
  county: string;
}

export interface QuoteContext {
  prices: LocalData["prices"];
  countyRates: LocalData["countyRates"];
}

function defaultContext(): QuoteContext {
  return { prices: defaultData.prices, countyRates: defaultData.countyRates };
}

function clampLinearFeet(raw: number): number {
  if (!Number.isFinite(raw) || raw < 1) {
    console.warn(`[fencepro] calcQuote: linearFeet=${String(raw)} clamped to 1`);
    return 1;
  }
  return raw;
}

export function calcQuote(input: CalcQuoteInput, ctx: QuoteContext = defaultContext()): Quote {
  const linearFeet = clampLinearFeet(input.linearFeet);
  const prices = ctx.prices[input.fenceType] ?? ctx.prices.wood_privacy;
  const sections = Math.ceil(linearFeet / 8);
  let mat = 0;
  const breakdown: BreakdownItem[] = [];

  if (input.fenceType === "wood_privacy") {
    const posts = sections + 1;
    const rails = sections * 2;
    const boards = sections * 11;
    const conc = posts;
    const postPrice = prices["4x4x8 Post"] ?? 0;
    const railPrice = prices["2x4x8 Rail"] ?? 0;
    const boardPrice = prices["1x6x6 Board"] ?? 0;
    const concPrice = prices["80lb Concrete"] ?? 0;
    mat = posts * postPrice + rails * railPrice + boards * boardPrice + conc * concPrice;
    breakdown.push(
      { item: "4x4x8 Posts", qty: posts, unit: postPrice },
      { item: "2x4x8 Rails", qty: rails, unit: railPrice },
      { item: "1x6x6 Boards", qty: boards, unit: boardPrice },
      { item: "Concrete bags", qty: conc, unit: concPrice },
    );
  } else {
    for (const [item, price] of Object.entries(prices)) {
      const qty = Math.ceil(sections * 1.2);
      mat += qty * price;
      breakdown.push({ item, qty, unit: price });
    }
  }

  // Labor sums per-tier (count × hours × wage). Hours come from user input
  // per tier instead of a sections-based heuristic — more accurate when
  // crews include leads or sub-crews on different rates.
  const labor = input.crew.reduce((s, m) => s + m.count * m.hours * m.hourlyWage, 0);
  const totalHours = input.crew.reduce((s, m) => s + m.count * m.hours, 0);
  const market = ctx.countyRates[input.county] ?? ctx.countyRates.default;

  return {
    materialCost: mat,
    laborCost: labor,
    totalCost: mat + labor,
    breakdown,
    totalHours,
    sections,
    marketLow: market.low * linearFeet,
    marketHigh: market.high * linearFeet,
  };
}
