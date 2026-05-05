export type FenceTypeId =
  | "wood_privacy"
  | "split_rail"
  | "chain_link"
  | "vinyl"
  | "wood_picket"
  | "ornamental";

export type StatusKind = "paid" | "active" | "pending";

export interface FenceType {
  id: FenceTypeId;
  label: string;
  icon: string;
  desc: string;
}

export interface Adjustment {
  label: string;
  amount: number;
}

export interface Project {
  id: string;
  client: string;
  county: string;
  fenceType: FenceTypeId;
  linearFeet: number;
  heightFt: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  depositRate: number;
  depositPaid: number;
  finalPrice: number;
  status: StatusKind;
  createdAt: string;
  paidAt: string | null;
  adjustments: Adjustment[];
  notes: string;
}

export interface BreakdownItem {
  item: string;
  qty: number;
  unit: number;
}

export interface Quote {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  breakdown: BreakdownItem[];
  totalHours: number;
  sections: number;
  marketLow: number;
  marketHigh: number;
}

export interface EstimateAnswers {
  county?: string;
  fenceType?: FenceType;
  linearFeet?: number;
  heightFt?: number;
  employees?: number;
  hourlyWage?: number;
}

export interface CountyRate {
  low: number;
  high: number;
}
