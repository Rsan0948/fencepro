import { useState } from "react";
import { useIsMobile } from "../../lib/useIsMobile";
import { sans, t } from "../../theme";

export interface CountyPickerProps {
  counties: string[];
  onSelect: (county: string) => void;
}

export function CountyPicker({ counties, onSelect }: CountyPickerProps) {
  const [q, setQ] = useState("");
  const isMobile = useIsMobile();
  const list = counties.filter((c) => c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search county..."
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          color: t.text,
          fontSize: 14,
          fontFamily: sans,
          outline: "none",
          minHeight: 44,
        }}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          maxHeight: 220,
          overflowY: "auto",
        }}
      >
        {list.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: isMobile ? "12px 14px" : "8px 14px",
              color: t.sub,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: sans,
              transition: "all 0.15s",
              minHeight: isMobile ? 44 : undefined,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = t.accent;
              e.currentTarget.style.color = t.accent;
              e.currentTarget.style.background = t.accentDim;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = t.border;
              e.currentTarget.style.color = t.sub;
              e.currentTarget.style.background = t.surface;
            }}
          >
            {c} County
          </button>
        ))}
      </div>
    </div>
  );
}
