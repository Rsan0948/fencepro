import { sans, t } from "../../theme";
import type { FenceType } from "../../types";

export interface FencePickerProps {
  fenceTypes: FenceType[];
  onSelect: (fence: FenceType) => void;
}

export function FencePicker({ fenceTypes, onSelect }: FencePickerProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {fenceTypes.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f)}
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "14px 16px",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = t.accent;
            e.currentTarget.style.background = t.accentDim;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.border;
            e.currentTarget.style.background = t.surface;
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
          <div style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: sans }}>
            {f.label}
          </div>
          <div style={{ color: t.muted, fontSize: 12, marginTop: 2, fontFamily: sans }}>
            {f.desc}
          </div>
        </button>
      ))}
    </div>
  );
}
