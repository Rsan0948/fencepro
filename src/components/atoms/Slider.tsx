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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: t.sub, fontSize: 13, fontFamily: mono }}>{label}</span>
        <span style={{ color: t.accent, fontSize: 20, fontWeight: 700, fontFamily: mono }}>
          {display(value)}
        </span>
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
