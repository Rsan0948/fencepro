import { data as defaultData } from "../data";
import type { LocalData } from "../data/types";
import type { BreakdownItem, FenceTypeId, Quote } from "../types";

export interface CalcQuoteInput {
  fenceType: FenceTypeId;
  linearFeet: number;
  heightFt: number;
  employees: number;
  hourlyWage: number;
  county: string;
}

export interface QuoteContext {
  prices: LocalData["prices"];
  countyRates: LocalData["countyRates"];
}

function defaultContext(): QuoteContext {
  return { prices: defaultData.prices, countyRates: defaultData.countyRates };
}

export function calcQuote(input: CalcQuoteInput, ctx: QuoteContext = defaultContext()): Quote {
  const prices = ctx.prices[input.fenceType] ?? ctx.prices.wood_privacy;
  const sections = Math.ceil(input.linearFeet / 8);
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

  const hrs = sections * (input.fenceType === "wood_privacy" ? 1.5 : 1.2);
  const labor = hrs * input.employees * input.hourlyWage;
  const market = ctx.countyRates[input.county] ?? ctx.countyRates.default;

  return {
    materialCost: mat,
    laborCost: labor,
    totalCost: mat + labor,
    breakdown,
    totalHours: hrs,
    sections,
    marketLow: market.low * input.linearFeet,
    marketHigh: market.high * input.linearFeet,
  };
}
