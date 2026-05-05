import type { CountyRate, FenceType, FenceTypeId, Project } from "../types";

export interface CompanyInfo {
  name: string;
  locale: string;
}

export interface CountyRates {
  default: CountyRate;
  [county: string]: CountyRate;
}

export type FencePrices = Record<FenceTypeId, Record<string, number>>;

export interface LocalData {
  company: CompanyInfo;
  counties: string[];
  countyRates: CountyRates;
  fenceTypes: FenceType[];
  prices: FencePrices;
  projects: Project[];
}
