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

export type { LocalData } from "./types";
