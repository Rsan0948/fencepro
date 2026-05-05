import { data as defaultData } from "../data";
import type { FenceType } from "../types";

export function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function fmtD(s: string): string {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fenceLabel(id: string, fenceTypes: FenceType[] = defaultData.fenceTypes): string {
  return fenceTypes.find((f) => f.id === id)?.label ?? id;
}
