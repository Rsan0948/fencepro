import type { Project } from "../types";

const KEY = "fencepro:projects:v1";
const SCHEMA_VERSION = 1;

interface StoredEnvelope {
  schemaVersion: 1;
  projects: Project[];
}

function isEnvelope(value: unknown): value is StoredEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { schemaVersion?: unknown; projects?: unknown };
  return candidate.schemaVersion === SCHEMA_VERSION && Array.isArray(candidate.projects);
}

export function loadProjects(seed: Project[]): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return seed;
    const parsed: unknown = JSON.parse(raw);
    return isEnvelope(parsed) ? parsed.projects : seed;
  } catch {
    return seed;
  }
}

export function saveProjects(projects: Project[]): void {
  const envelope: StoredEnvelope = { schemaVersion: SCHEMA_VERSION, projects };
  localStorage.setItem(KEY, JSON.stringify(envelope));
}

export function clearProjects(): void {
  localStorage.removeItem(KEY);
}
