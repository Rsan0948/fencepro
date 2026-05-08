import defaults from "./defaults";
import type { LocalData } from "./types";

const localModules = import.meta.glob<{ default: Partial<LocalData> }>("./local.ts", {
  eager: true,
});

const local: Partial<LocalData> | null = Object.values(localModules)[0]?.default ?? null;

function mergeData(base: LocalData, override: Partial<LocalData>): LocalData {
  return {
    company: { ...base.company, ...(override.company ?? {}) },
    counties: override.counties ?? base.counties,
    countyRates: { ...base.countyRates, ...(override.countyRates ?? {}) },
    fenceTypes: override.fenceTypes ?? base.fenceTypes,
    prices: { ...base.prices, ...(override.prices ?? {}) },
    projects: override.projects ?? base.projects,
  };
}

export const isLocalLoaded: boolean = local !== null;
export const data: LocalData = local ? mergeData(defaults, local) : defaults;

if (!data.countyRates.default) {
  throw new Error(
    "[fencepro] data.countyRates.default is missing. " +
      "Every loader (defaults.ts and any src/data/local.ts override) must " +
      "include a `default` entry so calcQuote has a market-rate fallback for " +
      "unknown counties.",
  );
}

export type { LocalData } from "./types";
