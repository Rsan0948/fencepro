import { useEffect, useState } from "react";
import { HoverBtn } from "../components/atoms/HoverBtn";
import { fmt } from "../lib/format";
import { remainingBalance, revisedTotal } from "../lib/project";
import { useIsMobile } from "../lib/useIsMobile";
import { isValidEmail } from "../lib/validate";
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
  const isMobile = useIsMobile();

  const revised = revisedTotal(project);
  const remaining = remainingBalance(project);
  const emailInvalid = clientEmail.trim() !== "" && !isValidEmail(clientEmail);
  const sendDisabled = !isValidEmail(clientEmail) || submitting;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit() {
    if (sendDisabled) return;
    setSubmitting(true);
    try {
      await onSend(project, clientEmail.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,8,13,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: isMobile ? 16 : 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Final invoice"
        style={{
          background: t.surface,
          border: `1px solid ${t.accent}`,
          borderRadius: 20,
          padding: isMobile ? 22 : 28,
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
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
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
            <div
              style={{
                color: t.text,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: sans,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {project.client}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close invoice modal"
            style={{
              background: "transparent",
              border: "none",
              color: t.muted,
              fontSize: 22,
              cursor: "pointer",
              minWidth: 44,
              minHeight: 44,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {(
          [
            { label: "Total Project Value", val: fmt(revised), accent: false },
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
              gap: 12,
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
          type="email"
          style={{
            width: "100%",
            background: t.bgAlt,
            border: `1px solid ${emailInvalid ? t.warn : t.border}`,
            borderRadius: 10,
            padding: "12px 14px",
            color: t.text,
            fontSize: 14,
            fontFamily: sans,
            outline: "none",
            margin: "16px 0 10px",
            minHeight: 44,
          }}
        />
        {emailInvalid && (
          <div style={{ color: t.warn, fontSize: 11, fontFamily: sans, margin: "0 0 10px" }}>
            Enter a valid email address (e.g. client@example.com).
          </div>
        )}
        <HoverBtn
          primary
          onClick={handleSubmit}
          disabled={sendDisabled}
          style={{ width: "100%", textAlign: "center", padding: "14px 18px", minHeight: 48 }}
        >
          {submitting ? "Sending…" : `Send Final Invoice via Stripe · ${fmt(remaining)}`}
        </HoverBtn>
      </div>
    </div>
  );
}
