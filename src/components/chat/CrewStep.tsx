import { useState } from "react";
import { fmt } from "../../lib/format";
import { mono, sans, t } from "../../theme";
import type { CrewMember } from "../../types";
import { ConfBtn } from "../atoms/ConfBtn";
import { Slider } from "../atoms/Slider";

export type { CrewMember } from "../../types";

export interface CrewValue {
  members: CrewMember[];
}

export interface CrewStepProps {
  onConfirm: (value: CrewValue) => void;
}

const DEFAULT_TIER: CrewMember = { count: 2, hourlyWage: 22, hours: 40 };

export function CrewStep({ onConfirm }: CrewStepProps) {
  const [members, setMembers] = useState<CrewMember[]>([DEFAULT_TIER]);

  function update(i: number, patch: Partial<CrewMember>) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function addTier() {
    setMembers((prev) => [...prev, { ...DEFAULT_TIER }]);
  }

  function removeTier(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  const totalHeadcount = members.reduce((s, m) => s + m.count, 0);
  const totalHours = members.reduce((s, m) => s + m.count * m.hours, 0);
  const totalLabor = members.reduce((s, m) => s + m.count * m.hours * m.hourlyWage, 0);
  const summary =
    members.length === 1
      ? `${members[0].count} ${members[0].count === 1 ? "worker" : "workers"} @ $${members[0].hourlyWage}/hr × ${members[0].hours} hrs · ${fmt(totalLabor)}`
      : `${totalHeadcount} workers · ${members.length} tiers · ${totalHours} hrs · ${fmt(totalLabor)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {members.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "14px 16px",
            background: t.bgAlt,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <input
              type="text"
              value={m.label ?? ""}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder={`TIER ${i + 1}`}
              aria-label={`Tier ${i + 1} label`}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `1px dashed ${t.border}`,
                color: t.text,
                fontSize: 11,
                fontFamily: mono,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "2px 4px",
                outline: "none",
                flex: 1,
                minWidth: 0,
                marginRight: 8,
              }}
            />
            {members.length > 1 && (
              <button
                onClick={() => removeTier(i)}
                aria-label={`Remove tier ${i + 1}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: t.muted,
                  cursor: "pointer",
                  fontSize: 18,
                  padding: 0,
                  minWidth: 36,
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            )}
          </div>
          <Slider
            label="Workers"
            min={1}
            max={20}
            step={1}
            value={m.count}
            onChange={(v) => update(i, { count: v })}
          />
          <Slider
            label="Hourly Wage"
            min={15}
            max={150}
            step={1}
            value={m.hourlyWage}
            onChange={(v) => update(i, { hourlyWage: v })}
            format={(v) => `$${v}/hr`}
          />
          <Slider
            label="Hours on Project"
            min={1}
            max={400}
            step={1}
            value={m.hours}
            onChange={(v) => update(i, { hours: v })}
            format={(v) => `${v} hrs`}
          />
        </div>
      ))}
      <button
        onClick={addTier}
        style={{
          background: t.accentDim,
          border: `1px solid ${t.accent}`,
          color: t.accent,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          fontFamily: mono,
          letterSpacing: "0.08em",
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        + ADD CREW TIER
      </button>
      <ConfBtn onClick={() => onConfirm({ members })} label={`Confirm: ${summary}`} />
      <div style={{ color: t.muted, fontSize: 11, fontFamily: sans, textAlign: "center" }}>
        Add a tier for each pay band on the crew (e.g. lead at $35/hr, two helpers at $22/hr).
      </div>
    </div>
  );
}
