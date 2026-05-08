import { useState } from "react";
import { Card } from "../components/atoms/Card";
import { HoverBtn } from "../components/atoms/HoverBtn";
import { Label } from "../components/atoms/Label";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { fenceLabel, fmt, fmtD } from "../lib/format";
import { useIsMobile } from "../lib/useIsMobile";
import { mono, sans, t } from "../theme";
import type { Adjustment, Project } from "../types";

export interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onInvoice: (project: Project) => void;
  onAddAdjustment: (projectId: string, adjustment: Adjustment) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectDetail({
  project,
  onBack,
  onInvoice,
  onAddAdjustment,
  onDelete,
}: ProjectDetailProps) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjLabel, setAdjLabel] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  const isMobile = useIsMobile();

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

  function handleDelete() {
    const ok = window.confirm(
      `Close ${project.client}? The project will be removed from your dashboard.`,
    );
    if (ok) onDelete(project.id);
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
        }}
      >
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
            padding: 0,
            minHeight: 44,
          }}
        >
          ← BACK
        </button>
        <button
          onClick={handleDelete}
          aria-label="Close project"
          style={{
            background: "transparent",
            border: `1px solid ${t.border}`,
            color: t.muted,
            fontSize: 11,
            fontFamily: mono,
            letterSpacing: "0.08em",
            cursor: "pointer",
            padding: "0 14px",
            borderRadius: 8,
            minHeight: 36,
          }}
        >
          × CLOSE PROJECT
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "flex-start",
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                color: t.text,
                fontSize: isMobile ? 20 : 24,
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
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
                  gap: 8,
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
                  gap: 8,
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
              padding: "8px 14px",
              cursor: "pointer",
              letterSpacing: "0.08em",
              minHeight: 36,
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
              gap: 8,
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
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 8,
              marginTop: 12,
            }}
          >
            <input
              value={adjLabel}
              onChange={(e) => setAdjLabel(e.target.value)}
              placeholder="Description (e.g. Added gate)"
              style={{
                flex: 2,
                background: t.bgAlt,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: "12px 14px",
                color: t.text,
                fontSize: 13,
                fontFamily: sans,
                outline: "none",
                minHeight: 44,
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
                padding: "12px 14px",
                color: t.text,
                fontSize: 13,
                fontFamily: mono,
                outline: "none",
                minHeight: 44,
              }}
            />
            <HoverBtn
              primary
              onClick={addAdjustment}
              style={{ padding: "12px 18px", textAlign: "center" }}
            >
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
