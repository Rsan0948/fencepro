import { data as defaultData } from "../data";
import type { FenceType } from "../types";

export function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// "YYYY-MM-DD" fed to `new Date()` parses as UTC midnight, which renders as
// the previous day in any timezone west of UTC. Parse date-only strings as
// local time instead.
export function parseISODateLocal(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(s);
}

export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtD(s: string): string {
  const d = parseISODateLocal(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fenceLabel(id: string, fenceTypes: FenceType[] = defaultData.fenceTypes): string {
  return fenceTypes.find((f) => f.id === id)?.label ?? id;
}
