import type { Adjustment, FenceTypeId, Project, StatusKind } from "../types";

const KEY = "fencepro:projects:v1";
const SCHEMA_VERSION = 1;

interface StoredEnvelope {
  schemaVersion: 1;
  projects: unknown[];
}

export interface LoadProjectsResult {
  projects: Project[];
  recovered: boolean;
}

function isEnvelope(value: unknown): value is StoredEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { schemaVersion?: unknown; projects?: unknown };
  return candidate.schemaVersion === SCHEMA_VERSION && Array.isArray(candidate.projects);
}

function asFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isAdjustment(value: unknown): value is Adjustment {
  if (typeof value !== "object" || value === null) return false;
  const a = value as { label?: unknown; amount?: unknown };
  return typeof a.label === "string" && typeof a.amount === "number" && Number.isFinite(a.amount);
}

// The envelope version gate catches wholesale schema changes, but a valid
// envelope can still hold hand-edited or partially-written projects. Rebuild
// each one field by field so a single bad entry (missing adjustments array,
// NaN amount, wrong status) degrades gracefully instead of crashing the
// dashboard math at render time.
function sanitizeProject(value: unknown): Project | null {
  if (typeof value !== "object" || value === null) return null;
  const p = value as Record<string, unknown>;
  if (typeof p.id !== "string" || typeof p.client !== "string") return null;
  const status: StatusKind =
    p.status === "paid" || p.status === "active" || p.status === "pending" ? p.status : "pending";
  return {
    id: p.id,
    client: p.client,
    clientEmail: typeof p.clientEmail === "string" ? p.clientEmail : undefined,
    county: typeof p.county === "string" ? p.county : "",
    fenceType: (typeof p.fenceType === "string" ? p.fenceType : "wood_privacy") as FenceTypeId,
    linearFeet: asFiniteNumber(p.linearFeet),
    heightFt: asFiniteNumber(p.heightFt),
    materialCost: asFiniteNumber(p.materialCost),
    laborCost: asFiniteNumber(p.laborCost),
    totalCost: asFiniteNumber(p.totalCost),
    depositRate: asFiniteNumber(p.depositRate),
    depositPaid: asFiniteNumber(p.depositPaid),
    finalPrice: asFiniteNumber(p.finalPrice),
    status,
    createdAt: typeof p.createdAt === "string" ? p.createdAt : "",
    paidAt: typeof p.paidAt === "string" ? p.paidAt : null,
    adjustments: Array.isArray(p.adjustments) ? p.adjustments.filter(isAdjustment) : [],
    notes: typeof p.notes === "string" ? p.notes : "",
    checkoutUrl: typeof p.checkoutUrl === "string" ? p.checkoutUrl : undefined,
  };
}

export function loadProjects(seed: Project[]): LoadProjectsResult {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return { projects: seed, recovered: false };
    const parsed: unknown = JSON.parse(raw);
    if (isEnvelope(parsed)) {
      const projects = parsed.projects.map(sanitizeProject).filter((p): p is Project => p !== null);
      return { projects, recovered: false };
    }
    return { projects: seed, recovered: true };
  } catch {
    return { projects: seed, recovered: true };
  }
}

export function saveProjects(projects: Project[]): void {
  const envelope = { schemaVersion: SCHEMA_VERSION, projects };
  try {
    localStorage.setItem(KEY, JSON.stringify(envelope));
  } catch (err) {
    // Quota exceeded or storage blocked (private mode). Losing persistence
    // beats crashing the render commit that triggered the save.
    console.warn("[fencepro] saveProjects failed; changes will not persist", err);
  }
}

export function clearProjects(): void {
  localStorage.removeItem(KEY);
}
