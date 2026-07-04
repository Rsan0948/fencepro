import { useState } from "react";
import { Card } from "../components/atoms/Card";
import { HoverBtn } from "../components/atoms/HoverBtn";
import { Label } from "../components/atoms/Label";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { fenceLabel, fmt, fmtD } from "../lib/format";
import { adjustmentsTotal, remainingBalance, revisedTotal } from "../lib/project";
import { useIsMobile } from "../lib/useIsMobile";
import { mono, sans, t } from "../theme";
import type { Adjustment, Project } from "../types";

export interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onInvoice: (project: Project) => void;
  onAddAdjustment: (projectId: string, adjustment: Adjustment) => void;
  onUpdateNotes: (projectId: string, notes: string) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectDetail({
  project,
  onBack,
  onInvoice,
  onAddAdjustment,
  onUpdateNotes,
  onDelete,
}: ProjectDetailProps) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjLabel, setAdjLabel] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  // App keys this component by project.id, so a fresh project mounts a
  // fresh instance and all per-project state (draft, adjustment form)
  // resets without any prop-mirroring effects.
  const [notesDraft, setNotesDraft] = useState(project.notes);
  const isMobile = useIsMobile();

  const notesDirty = notesDraft !== project.notes;

  const adjustTotal = adjustmentsTotal(project);
  const revised = revisedTotal(project);
  const remaining = remainingBalance(project);

  // Commit on blur as well as on the explicit button: clicking ← BACK (or
  // anywhere else) blurs the textarea first, so a typed draft is never
  // silently lost to navigation.
  function commitNotes() {
    if (notesDirty) onUpdateNotes(project.id, notesDraft);
  }

  const adjLabelClean = adjLabel.trim();
  const adjAmountNum = Number(adjAmount);
  const adjustValid =
    adjLabelClean !== "" && adjAmount.trim() !== "" && Number.isFinite(adjAmountNum);

  function addAdjustment() {
    if (!adjustValid) return;
    onAddAdjustment(project.id, { label: adjLabelClean, amount: adjAmountNum });
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
              { label: "Revised Total", val: fmt(revised), color: t.text },
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
              disabled={!adjustValid}
              style={{ padding: "12px 18px", textAlign: "center" }}
            >
              Add
            </HoverBtn>
          </div>
        )}
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            gap: 8,
          }}
        >
          <Label>Notes</Label>
          {notesDirty && (
            <HoverBtn
              primary
              onClick={commitNotes}
              style={{
                fontSize: 11,
                fontFamily: mono,
                fontWeight: 400,
                letterSpacing: "0.08em",
                padding: "6px 12px",
                borderRadius: 6,
                minHeight: 36,
              }}
            >
              SAVE NOTES
            </HoverBtn>
          )}
        </div>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={commitNotes}
          placeholder="Job-site details, gate codes, scheduling constraints…"
          rows={4}
          aria-label="Project notes"
          style={{
            width: "100%",
            background: t.bgAlt,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: "12px 14px",
            color: t.sub,
            fontSize: 14,
            fontFamily: sans,
            lineHeight: 1.6,
            outline: "none",
            resize: "vertical",
            minHeight: 96,
          }}
        />
      </Card>
    </div>
  );
}
