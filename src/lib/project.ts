import type { Project } from "../types";

// Billing math used by the detail screen, invoice modal, dashboard,
// project rows, and the CSV export — keep it in one place so the numbers
// a client sees can never drift between surfaces.
export function adjustmentsTotal(project: Project): number {
  return project.adjustments.reduce((sum, a) => sum + a.amount, 0);
}

export function revisedTotal(project: Project): number {
  return project.finalPrice + adjustmentsTotal(project);
}

export function remainingBalance(project: Project): number {
  return revisedTotal(project) - project.depositPaid;
}
