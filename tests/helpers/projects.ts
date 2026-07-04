import type { Project } from "../../src/types";

const CURRENT_YEAR = new Date().getFullYear();

// Shared base fixture for suites that need a Project. createdAt defaults to
// the current year so Dashboard's YTD filter keeps matching as years roll.
export function makeProject(overrides: Partial<Project> = {}): Project {
  const base: Project = {
    id: "p_test",
    client: "Test Client",
    county: "Central",
    fenceType: "wood_privacy",
    linearFeet: 100,
    heightFt: 6,
    materialCost: 1000,
    laborCost: 500,
    totalCost: 1500,
    depositRate: 0.4,
    depositPaid: 0,
    finalPrice: 2000,
    status: "pending",
    createdAt: `${CURRENT_YEAR}-02-15`,
    paidAt: null,
    adjustments: [],
    notes: "",
  };
  return { ...base, ...overrides };
}
