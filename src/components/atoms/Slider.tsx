import { useEffect, useState } from "react";
import { mono, t } from "../../theme";

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function Slider({ label, min, max, step, value, onChange, format }: SliderProps) {
  const display = (n: number): string => (format ? format(n) : String(n));
  const [draft, setDraft] = useState<string>(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commitDraft(raw: string) {
    if (raw === "") {
      setDraft(String(value));
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
    setDraft(String(clamped));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: t.sub, fontSize: 13, fontFamily: mono }}>{label}</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commitDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitDraft((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).blur();
            }
          }}
          style={{
            width: 96,
            background: t.bgAlt,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: "6px 10px",
            color: t.accent,
            fontSize: 18,
            fontWeight: 700,
            fontFamily: mono,
            textAlign: "right",
            outline: "none",
            minHeight: 36,
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: t.accent, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: t.muted, fontSize: 11, fontFamily: mono }}>{display(min)}</span>
        <span style={{ color: t.muted, fontSize: 11, fontFamily: mono }}>{display(max)}</span>
      </div>
    </div>
  );
}
