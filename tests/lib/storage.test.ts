import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProjects, loadProjects, saveProjects } from "../../src/lib/storage";
import type { Project } from "../../src/types";

const SEED: Project[] = [
  {
    id: "seed-1",
    client: "Seed Client",
    county: "Central",
    fenceType: "wood_privacy",
    linearFeet: 100,
    heightFt: 6,
    materialCost: 1000,
    laborCost: 500,
    totalCost: 1500,
    depositRate: 0.4,
    depositPaid: 600,
    finalPrice: 1800,
    status: "pending",
    createdAt: "2026-01-01",
    paidAt: null,
    adjustments: [],
    notes: "",
  },
];

const KEY = "fencepro:projects:v1";

let store = new Map<string, string>();
const fakeStorage: Storage = {
  get length() {
    return store.size;
  },
  clear() {
    store.clear();
  },
  getItem(key: string) {
    return store.get(key) ?? null;
  },
  key(index: number) {
    return Array.from(store.keys())[index] ?? null;
  },
  removeItem(key: string) {
    store.delete(key);
  },
  setItem(key: string, value: string) {
    store.set(key, value);
  },
};

beforeEach(() => {
  store = new Map<string, string>();
  vi.stubGlobal("localStorage", fakeStorage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("storage", () => {
  it("returns the seed when localStorage is empty (recovered=false)", () => {
    const result = loadProjects(SEED);
    expect(result.projects).toEqual(SEED);
    expect(result.recovered).toBe(false);
  });

  it("round-trips saved projects without recovery", () => {
    const persisted: Project[] = [{ ...SEED[0], id: "persisted" }];
    saveProjects(persisted);
    const result = loadProjects(SEED);
    expect(result.projects).toEqual(persisted);
    expect(result.recovered).toBe(false);
  });

  it("recovers from a schema version mismatch", () => {
    fakeStorage.setItem(KEY, JSON.stringify({ schemaVersion: 99, projects: [] }));
    const result = loadProjects(SEED);
    expect(result.projects).toEqual(SEED);
    expect(result.recovered).toBe(true);
  });

  it("recovers from corrupted JSON", () => {
    fakeStorage.setItem(KEY, "{not-valid-json");
    const result = loadProjects(SEED);
    expect(result.projects).toEqual(SEED);
    expect(result.recovered).toBe(true);
  });

  it("recovers when the stored value is the wrong shape", () => {
    fakeStorage.setItem(KEY, JSON.stringify(["not", "an", "envelope"]));
    const result = loadProjects(SEED);
    expect(result.projects).toEqual(SEED);
    expect(result.recovered).toBe(true);
  });

  it("clearProjects removes the envelope", () => {
    saveProjects(SEED);
    clearProjects();
    expect(fakeStorage.getItem(KEY)).toBeNull();
  });
});
