import { describe, expect, it } from "vitest";
import { projectsToCsv } from "../../src/lib/csv";
import { makeProject } from "../helpers/projects";

describe("projectsToCsv", () => {
  it("emits a header row followed by one row per project", () => {
    const csv = projectsToCsv([makeProject(), makeProject({ id: "p2", client: "Second Co" })]);
    const lines = csv.trimEnd().split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("Client,Client Email,County,Fence Type");
    expect(lines[1]).toContain("Test Client");
    expect(lines[2]).toContain("Second Co");
  });

  it("maps the fence type id to its human label", () => {
    const csv = projectsToCsv([makeProject({ fenceType: "wood_privacy" })]);
    expect(csv).toContain("Wood Privacy");
    expect(csv).not.toContain("wood_privacy");
  });

  it("includes adjustments total and revised total", () => {
    const csv = projectsToCsv([
      makeProject({
        finalPrice: 2000,
        adjustments: [
          { label: "Gate", amount: 240 },
          { label: "Discount", amount: -40 },
        ],
      }),
    ]);
    const row = csv.trimEnd().split("\r\n")[1];
    expect(row).toContain(",200,"); // adjustments total
    expect(row).toContain(",2200,"); // revised total
  });

  it("quotes fields containing commas and doubles embedded quotes", () => {
    const csv = projectsToCsv([
      makeProject({ client: 'Smith, Jones & "Sons"', notes: "Line one\nLine two" }),
    ]);
    expect(csv).toContain('"Smith, Jones & ""Sons"""');
    expect(csv).toContain('"Line one\nLine two"');
  });

  it("renders empty strings for missing optional fields", () => {
    const csv = projectsToCsv([makeProject({ createdAt: "2026-01-01", paidAt: null })]);
    const row = csv.trimEnd().split("\r\n")[1];
    expect(row.startsWith("Test Client,,Central")).toBe(true);
    expect(row).toContain("2026-01-01,,");
  });

  it("neutralizes formula-leading text fields against CSV injection", () => {
    const csv = projectsToCsv([
      makeProject({
        client: '=HYPERLINK("http://evil.example","x")',
        notes: "@mention first",
      }),
    ]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'@mention first");
  });

  it("leaves negative numeric fields untouched by injection escaping", () => {
    const csv = projectsToCsv([makeProject({ adjustments: [{ label: "Credit", amount: -40 }] })]);
    const row = csv.trimEnd().split("\r\n")[1];
    expect(row).toContain(",-40,");
    expect(row).not.toContain("'-40");
  });
});
