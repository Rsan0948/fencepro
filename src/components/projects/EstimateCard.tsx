import { useState } from "react";
import { fmt } from "../../lib/format";
import { mono, sans, t } from "../../theme";
import type { EstimateAnswers, Quote } from "../../types";
import { ConfBtn } from "../atoms/ConfBtn";
import { Label } from "../atoms/Label";
import { Pill } from "../atoms/Pill";
import { Slider } from "../atoms/Slider";

export interface EstimateSavePayload {
  clientName: string;
  clientEmail: string;
  finalPrice: number;
  depositAmt: number;
  depositPct: number;
  margin: number;
  answers: EstimateAnswers;
  quote: Quote;
}

export interface EstimateCardProps {
  quote: Quote;
  answers: EstimateAnswers;
  onSave?: (payload: EstimateSavePayload) => void;
}

type DepositMode = "materials" | "custom";
type TabId = "summary" | "breakdown" | "market";

const TABS: TabId[] = ["summary", "breakdown", "market"];

export function EstimateCard({ quote, answers, onSave }: EstimateCardProps) {
  const [margin, setMargin] = useState(25);
  const [view, setView] = useState<TabId>("summary");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [depositMode, setDepositMode] = useState<DepositMode>("materials");
  const [customDepositPct, setCustomDepositPct] = useState(40);
  const [sent, setSent] = useState(false);

  const finalPrice = quote.totalCost * (1 + margin / 100);
  const profit = finalPrice - quote.totalCost;

  const materialsCoverPct = Math.round((quote.materialCost / finalPrice) * 100);
  const depositPct = depositMode === "materials" ? materialsCoverPct : customDepositPct;
  const depositAmt = finalPrice * (depositPct / 100);
  const balanceAmt = finalPrice - depositAmt;

  return (
    <div style={{ animation: "fadeSlideUp 0.5s ease" }}>
      <div
        style={{
          background: `linear-gradient(135deg,${t.surface} 0%,#1a1a2e 100%)`,
          border: `1px solid ${t.accent}`,
          borderRadius: "16px 16px 0 0",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              color: t.accent,
              fontSize: 11,
              letterSpacing: "0.15em",
              fontFamily: mono,
              marginBottom: 4,
            }}
          >
            YOUR ESTIMATE
          </div>
          <div style={{ color: t.text, fontSize: 28, fontWeight: 700, fontFamily: sans }}>
            {fmt(finalPrice)}
          </div>
          <div style={{ color: t.muted, fontSize: 12, fontFamily: mono, marginTop: 2 }}>
            {answers.county} Co. · {answers.fenceType?.label} · {answers.linearFeet} lin ft
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: t.success, fontSize: 13, fontFamily: mono }}>+{fmt(profit)}</div>
          <div style={{ color: t.muted, fontSize: 11, marginTop: 2, fontFamily: mono }}>
            {margin}% margin
          </div>
        </div>
      </div>

      <div
        style={{
          background: t.surface,
          borderLeft: `1px solid ${t.accent}`,
          borderRight: `1px solid ${t.accent}`,
          padding: "16px 24px",
        }}
      >
        <Slider
          label="Profit Margin"
          min={5}
          max={60}
          step={1}
          value={margin}
          onChange={setMargin}
          format={(v) => `${v}%`}
        />
      </div>

      <div
        style={{
          background: t.surface,
          borderLeft: `1px solid ${t.accent}`,
          borderRight: `1px solid ${t.accent}`,
          borderTop: `1px solid ${t.border}`,
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Label>Deposit Rate</Label>
          <div style={{ display: "flex", gap: 6 }}>
            {(
              [
                { id: "materials", label: "Cover Materials" },
                { id: "custom", label: "Custom" },
              ] as Array<{ id: DepositMode; label: string }>
            ).map((opt) => (
              <Pill
                key={opt.id}
                active={depositMode === opt.id}
                onClick={() => setDepositMode(opt.id)}
              >
                {opt.label}
              </Pill>
            ))}
          </div>
        </div>
        {depositMode === "custom" && (
          <div style={{ marginBottom: 12 }}>
            <Slider
              label="Deposit %"
              min={10}
              max={75}
              step={5}
              value={customDepositPct}
              onChange={setCustomDepositPct}
              format={(v) => `${v}%`}
            />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: `Deposit (${depositPct}%)`, val: depositAmt, color: t.success },
            { label: "Balance Due", val: balanceAmt, color: t.warn },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: t.bgAlt,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  color: t.muted,
                  fontSize: 10,
                  fontFamily: mono,
                  letterSpacing: "0.1em",
                  marginBottom: 4,
                }}
              >
                {s.label.toUpperCase()}
              </div>
              <div style={{ color: s.color, fontSize: 18, fontWeight: 700, fontFamily: mono }}>
                {fmt(s.val)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: t.surface,
          borderLeft: `1px solid ${t.accent}`,
          borderRight: `1px solid ${t.accent}`,
          borderTop: `1px solid ${t.border}`,
          display: "flex",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: view === tab ? t.accentDim : "transparent",
              border: "none",
              borderBottom: view === tab ? `2px solid ${t.accent}` : "2px solid transparent",
              color: view === tab ? t.accent : t.muted,
              fontSize: 12,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: mono,
              textTransform: "uppercase",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        style={{
          background: t.surface,
          borderLeft: `1px solid ${t.accent}`,
          borderRight: `1px solid ${t.accent}`,
          padding: "20px 24px",
          minHeight: 140,
        }}
      >
        {view === "summary" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(
              [
                ["Materials", fmt(quote.materialCost), t.text],
                ["Labor", fmt(quote.laborCost), t.text],
                ["Subtotal", fmt(quote.totalCost), t.sub],
                ["Margin", fmt(profit), t.success],
                ["Client Price", fmt(finalPrice), t.accent],
              ] as Array<[string, string, string]>
            ).map(([l, v, c]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <span style={{ color: t.sub, fontSize: 13, fontFamily: sans }}>{l}</span>
                <span style={{ color: c, fontSize: 14, fontWeight: 600, fontFamily: mono }}>
                  {v}
                </span>
              </div>
            ))}
            <div style={{ color: t.muted, fontSize: 11, marginTop: 6, fontFamily: mono }}>
              {quote.sections} sections · {quote.totalHours.toFixed(0)} labor hrs
            </div>
          </div>
        )}
        {view === "breakdown" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Label>Materials Bill</Label>
            {quote.breakdown.map((r) => (
              <div
                key={r.item}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <span style={{ color: t.sub, fontSize: 13, fontFamily: sans }}>
                  {r.item} x {r.qty}
                </span>
                <span style={{ color: t.text, fontSize: 13, fontFamily: mono }}>
                  {fmt(r.qty * r.unit)}
                </span>
              </div>
            ))}
          </div>
        )}
        {view === "market" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Label>{answers.county?.toUpperCase()} County Market Rates</Label>
            <div style={{ display: "flex", gap: 10 }}>
              {(
                [
                  ["Market Low", fmt(quote.marketLow)],
                  ["Market High", fmt(quote.marketHigh)],
                  ["Your Quote", fmt(finalPrice)],
                ] as Array<[string, string]>
              ).map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: t.bgAlt,
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      color: t.muted,
                      fontSize: 10,
                      fontFamily: mono,
                      letterSpacing: "0.08em",
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </div>
                  <div style={{ color: t.accent, fontSize: 15, fontWeight: 700, fontFamily: mono }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ color: t.sub, fontSize: 12, fontFamily: sans, lineHeight: 1.6 }}>
              {finalPrice < quote.marketLow
                ? "⚠ Below market - consider raising margin."
                : finalPrice > quote.marketHigh
                  ? "⚠ Above market high - competitive risk."
                  : "✓ Competitive within local market range."}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: t.surface,
          borderLeft: `1px solid ${t.accent}`,
          borderRight: `1px solid ${t.accent}`,
          borderTop: `1px solid ${t.border}`,
          borderRadius: "0 0 16px 16px",
          padding: "20px 24px",
        }}
      >
        <Label>Send Estimate</Label>
        {!sent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name"
              style={{
                background: t.bgAlt,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: t.text,
                fontSize: 14,
                fontFamily: sans,
                outline: "none",
              }}
            />
            <input
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Client email"
              style={{
                background: t.bgAlt,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: t.text,
                fontSize: 14,
                fontFamily: sans,
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <ConfBtn
                onClick={() => {
                  if (clientName && clientEmail) {
                    setSent(true);
                    onSave?.({
                      clientName,
                      clientEmail,
                      finalPrice,
                      depositAmt,
                      depositPct,
                      margin,
                      answers,
                      quote,
                    });
                  }
                }}
                label={`Send Estimate · Deposit ${fmt(depositAmt)}`}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              background: t.successDim,
              border: `1px solid ${t.success}33`,
              borderRadius: 10,
              padding: "14px 16px",
              color: t.success,
              fontSize: 13,
              fontFamily: sans,
            }}
          >
            ✓ Estimate sent to {clientEmail} - deposit request of {fmt(depositAmt)} via Stripe
          </div>
        )}
      </div>
    </div>
  );
}
