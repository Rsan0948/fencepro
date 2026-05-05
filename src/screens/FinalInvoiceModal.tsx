import { useState } from "react";
import { HoverBtn } from "../components/atoms/HoverBtn";
import { fmt } from "../lib/format";
import { mono, sans, t } from "../theme";
import type { Project } from "../types";

export interface FinalInvoiceModalProps {
  project: Project;
  onClose: () => void;
  onSend: (project: Project, clientEmail: string) => void | Promise<void>;
}

export function FinalInvoiceModal({ project, onClose, onSend }: FinalInvoiceModalProps) {
  const [clientEmail, setClientEmail] = useState(project.clientEmail ?? "");
  const [submitting, setSubmitting] = useState(false);

  const adjustTotal = project.adjustments.reduce((s, a) => s + a.amount, 0);
  const revisedTotal = project.finalPrice + adjustTotal;
  const remaining = revisedTotal - project.depositPaid;

  async function handleSubmit() {
    if (!clientEmail || submitting) return;
    setSubmitting(true);
    try {
      await onSend(project, clientEmail);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,8,13,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.accent}`,
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 460,
          animation: "fadeSlideUp 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                color: t.accent,
                fontSize: 10,
                fontFamily: mono,
                letterSpacing: "0.12em",
                marginBottom: 4,
              }}
            >
              FINAL INVOICE
            </div>
            <div style={{ color: t.text, fontSize: 18, fontWeight: 700, fontFamily: sans }}>
              {project.client}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: t.muted,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {(
          [
            { label: "Total Project Value", val: fmt(revisedTotal), accent: false },
            { label: "Deposit Already Paid", val: "-" + fmt(project.depositPaid), accent: false },
            { label: "Remaining Balance", val: fmt(remaining), accent: true },
          ] as Array<{ label: string; val: string; accent: boolean }>
        ).map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <span style={{ color: t.sub, fontSize: 14, fontFamily: sans }}>{r.label}</span>
            <span
              style={{
                color: r.accent ? t.accent : t.text,
                fontSize: r.accent ? 18 : 14,
                fontWeight: r.accent ? 700 : 400,
                fontFamily: mono,
              }}
            >
              {r.val}
            </span>
          </div>
        ))}

        <input
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="Client email address"
          style={{
            width: "100%",
            background: t.bgAlt,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "11px 14px",
            color: t.text,
            fontSize: 14,
            fontFamily: sans,
            outline: "none",
            margin: "16px 0 10px",
          }}
        />
        <HoverBtn
          primary
          onClick={handleSubmit}
          style={{ width: "100%", textAlign: "center" }}
        >
          {submitting ? "Sending…" : `Send Final Invoice via Stripe · ${fmt(remaining)}`}
        </HoverBtn>
      </div>
    </div>
  );
}
