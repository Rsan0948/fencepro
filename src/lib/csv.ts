import { fenceLabel } from "./format";
import { adjustmentsTotal, revisedTotal } from "./project";
import type { Project } from "../types";

// Spreadsheet apps execute cells starting with = + - @ as formulas (CSV
// injection). Free-text fields get a leading apostrophe — Excel/Sheets
// treat it as a text marker — while numeric fields pass through untouched
// so negative amounts stay numbers.
function neutralizeFormula(s: string): string {
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

// RFC 4180: quote any field containing a comma, quote, or line break;
// double embedded quotes.
function csvField(value: string | number): string {
  const s = typeof value === "string" ? neutralizeFormula(value) : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEADERS = [
  "Client",
  "Client Email",
  "County",
  "Fence Type",
  "Linear Ft",
  "Height Ft",
  "Material Cost",
  "Labor Cost",
  "Total Cost",
  "Final Price",
  "Adjustments Total",
  "Revised Total",
  "Deposit Paid",
  "Status",
  "Created",
  "Paid At",
  "Notes",
];

export function projectsToCsv(projects: Project[]): string {
  const rows = projects.map((p) =>
    [
      p.client,
      p.clientEmail ?? "",
      p.county,
      fenceLabel(p.fenceType),
      p.linearFeet,
      p.heightFt,
      p.materialCost,
      p.laborCost,
      p.totalCost,
      p.finalPrice,
      adjustmentsTotal(p),
      revisedTotal(p),
      p.depositPaid,
      p.status,
      p.createdAt,
      p.paidAt ?? "",
      p.notes,
    ]
      .map(csvField)
      .join(","),
  );
  return [HEADERS.join(","), ...rows].join("\r\n") + "\r\n";
}

export function downloadCsv(filename: string, csv: string): void {
  // Leading BOM: Excel ignores the Blob's charset hint and falls back to
  // ANSI without it, mangling any non-ASCII client name or note.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Some browsers start the blob fetch asynchronously after click();
  // revoking in the same task can cancel the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
