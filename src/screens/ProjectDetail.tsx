import { useState } from "react";
import { Card } from "../components/atoms/Card";
import { HoverBtn } from "../components/atoms/HoverBtn";
import { Label } from "../components/atoms/Label";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { fenceLabel, fmt, fmtD } from "../lib/format";
import { mono, sans, t } from "../theme";
import type { Adjustment, Project } from "../types";

export interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onInvoice: (project: Project) => void;
  onAddAdjustment: (projectId: string, adjustment: Adjustment) => void;
}

export function ProjectDetail({ project, onBack, onInvoice, onAddAdjustment }: ProjectDetailProps) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjLabel, setAdjLabel] = useState("");
  const [adjAmount, setAdjAmount] = useState("");

  const adjustTotal = project.adjustments.reduce((s, a) => s + a.amount, 0);
  const revisedTotal = project.finalPrice + adjustTotal;
  const remaining = revisedTotal - project.depositPaid;

  function addAdjustment() {
    if (!adjLabel || !adjAmount) return;
    onAddAdjustment(project.id, { label: adjLabel, amount: Number(adjAmount) });
    setAdjLabel("");
    setAdjAmount("");
    setShowAdjust(false);
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      <button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: t.muted,
          fontSize: 13,
          fontFamily: mono,
          cursor: "pointer",
          letterSpacing: "0.08em",
          marginBottom: 20,
          padding: 0,
        }}
      >
        ← BACK
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h1
              style={{
                color: t.text,
                fontSize: 24,
                fontWeight: 700,
                fontFamily: sans,
                letterSpacing: "-0.02em",
              }}
            >
              {project.client}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <div style={{ color: t.muted, fontSize: 12, fontFamily: mono }}>
            {project.county} County · {fenceLabel(project.fenceType)} · {project.linearFeet} lin ft
          </div>
        </div>
        {project.status !== "paid" && (
          <HoverBtn primary onClick={() => onInvoice(project)}>
            Generate Final Invoice
          </HoverBtn>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <Label>Financial Summary</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {[
              { label: "Original Estimate", val: fmt(project.finalPrice), color: t.text },
              {
                label: "Adjustments",
                val: (adjustTotal >= 0 ? "+" : "") + fmt(adjustTotal),
                color: adjustTotal !== 0 ? t.accent : t.muted,
              },
              { label: "Revised Total", val: fmt(revisedTotal), color: t.text },
              { label: "Deposit Collected", val: "-" + fmt(project.depositPaid), color: t.success },
              {
                label: "Remaining Balance",
                val: fmt(remaining),
                color: project.status === "paid" ? t.muted : t.warn,
              },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <span style={{ color: t.sub, fontSize: 13, fontFamily: sans }}>{r.label}</span>
                <span style={{ color: r.color, fontSize: 13, fontFamily: mono, fontWeight: 600 }}>
                  {r.val}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Label>Project Details</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {[
              { label: "Fence Type", val: fenceLabel(project.fenceType) },
              { label: "Dimensions", val: `${project.linearFeet} ft x ${project.heightFt} ft` },
              { label: "County", val: `${project.county} County` },
              { label: "Created", val: fmtD(project.createdAt) },
              { label: "Materials", val: fmt(project.materialCost) },
              { label: "Labor", val: fmt(project.laborCost) },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <span style={{ color: t.sub, fontSize: 13, fontFamily: sans }}>{r.label}</span>
                <span style={{ color: t.text, fontSize: 13, fontFamily: mono }}>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Label>{"Change Orders & Adjustments"}</Label>
          <button
            onClick={() => setShowAdjust((s) => !s)}
            style={{
              background: t.accentDim,
              border: `1px solid ${t.accent}`,
              color: t.accent,
              fontSize: 11,
              fontFamily: mono,
              borderRadius: 6,
              padding: "4px 10px",
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            + ADD
          </button>
        </div>
        {project.adjustments.length === 0 && !showAdjust && (
          <div style={{ color: t.muted, fontSize: 13, fontFamily: sans, padding: "8px 0" }}>
            No adjustments recorded.
          </div>
        )}
        {project.adjustments.map((a, i) => (
          <div
            key={`${a.label}-${i}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <span style={{ color: t.sub, fontSize: 13, fontFamily: sans }}>{a.label}</span>
            <span style={{ color: t.accent, fontSize: 13, fontFamily: mono }}>
              {a.amount >= 0 ? "+" : ""}
              {fmt(a.amount)}
            </span>
          </div>
        ))}
        {showAdjust && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              value={adjLabel}
              onChange={(e) => setAdjLabel(e.target.value)}
              placeholder="Description (e.g. Added gate)"
              style={{
                flex: 2,
                background: t.bgAlt,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: "8px 12px",
                color: t.text,
                fontSize: 13,
                fontFamily: sans,
                outline: "none",
              }}
            />
            <input
              value={adjAmount}
              onChange={(e) => setAdjAmount(e.target.value)}
              placeholder="$"
              type="number"
              style={{
                flex: 1,
                background: t.bgAlt,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: "8px 12px",
                color: t.text,
                fontSize: 13,
                fontFamily: mono,
                outline: "none",
              }}
            />
            <HoverBtn primary onClick={addAdjustment} style={{ padding: "8px 14px" }}>
              Add
            </HoverBtn>
          </div>
        )}
      </Card>

      {project.notes && (
        <Card>
          <Label>Notes</Label>
          <p
            style={{ color: t.sub, fontSize: 14, fontFamily: sans, lineHeight: 1.6, marginTop: 6 }}
          >
            {project.notes}
          </p>
        </Card>
      )}
    </div>
  );
}
