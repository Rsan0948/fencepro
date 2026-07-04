import type { ReactNode } from "react";
import { mono, t } from "../../theme";

export interface PillProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}

export function Pill({ children, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? t.accentDim : "transparent",
        border: `1px solid ${active ? t.accent : t.border}`,
        color: active ? t.accent : t.sub,
        borderRadius: 8,
        padding: "7px 16px",
        fontSize: 13,
        fontFamily: mono,
        cursor: "pointer",
        transition: "all 0.15s",
        minHeight: 36,
      }}
    >
      {children}
    </button>
  );
}
