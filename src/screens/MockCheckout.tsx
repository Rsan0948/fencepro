import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fmt } from "../lib/format";
import { useIsMobile } from "../lib/useIsMobile";
import { getMockSessionRecord, markSessionPaid } from "../services/payments";

const PAGE_BG = "#f7f7f5";
const CARD_BG = "#ffffff";
const TEXT = "#0f1f3a";
const MUTED = "#637087";
const BORDER = "#e5e7eb";
const ACCENT = "#635bff";
const SUCCESS = "#1f8a4c";

export function MockCheckout() {
  const params = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const sessionId = params.sessionId ?? "";
  const record = getMockSessionRecord(sessionId);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") navigate("/");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (!record) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: PAGE_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: TEXT,
        }}
      >
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: isMobile ? 24 : 32,
            maxWidth: 460,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 22, margin: "0 0 12px" }}>This checkout has expired</h1>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 24px" }}>
            The mock session is held in-memory only and was lost on refresh.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: ACCENT,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Back to FencePro
          </button>
        </div>
      </div>
    );
  }

  if (record.status === "paid") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: PAGE_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: TEXT,
        }}
      >
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: isMobile ? 24 : 32,
            maxWidth: 460,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              color: SUCCESS,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            (Demo) hosted checkout
          </div>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Payment received</h1>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 6px" }}>
            This session was already paid.
          </p>
          <p
            style={{
              fontSize: 24,
              color: TEXT,
              fontWeight: 700,
              margin: "4px 0 24px",
            }}
          >
            {fmt(record.input.amount)}
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: ACCENT,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Back to FencePro
          </button>
        </div>
      </div>
    );
  }

  async function handlePay() {
    setPaying(true);
    await markSessionPaid(sessionId);
    navigate("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAGE_BG,
        padding: isMobile ? "32px 16px" : "56px 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: TEXT,
      }}
    >
      <div
        style={{
          maxWidth: 460,
          margin: "0 auto",
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: isMobile ? 24 : 36,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: MUTED,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          (Demo) hosted checkout
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 4px", fontWeight: 700 }}>
          {fmt(record.input.amount)}
        </h1>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>
          {record.input.description}
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16, marginBottom: 16 }}>
          {(
            [
              ["Type", record.input.metadata.type === "deposit" ? "Deposit" : "Final balance"],
              ["Project", record.input.metadata.projectId],
              ["To", record.input.customerEmail],
              ["Status", "Awaiting payment"],
            ] as Array<[string, string]>
          ).map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontSize: 13,
                gap: 12,
              }}
            >
              <span style={{ color: MUTED, flexShrink: 0 }}>{label}</span>
              <span
                style={{
                  color: TEXT,
                  fontWeight: 500,
                  textAlign: "right",
                  wordBreak: "break-all",
                  minWidth: 0,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#f4f4f7",
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: "12px 14px",
            color: MUTED,
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          {
            "This is FencePro's mocked Stripe checkout. No card is collected and no real money moves. Production wire-up notes live in docs/integrations/stripe.md."
          }
        </div>

        <button
          onClick={handlePay}
          disabled={paying}
          style={{
            width: "100%",
            background: ACCENT,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 600,
            cursor: paying ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            minHeight: 48,
          }}
        >
          {paying ? "Processing…" : `Pay ${fmt(record.input.amount)}`}
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: "none",
            color: MUTED,
            fontSize: 13,
            cursor: "pointer",
            display: "block",
            margin: "18px auto 0",
            padding: "6px 12px",
            minHeight: 44,
          }}
        >
          ← Back to FencePro
        </button>
      </div>
    </div>
  );
}
