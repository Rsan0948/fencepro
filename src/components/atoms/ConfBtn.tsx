import { useState } from "react";
import { sans, t } from "../../theme";

export interface ConfBtnProps {
  onClick: () => void;
  label: string;
}

export function ConfBtn({ onClick, label }: ConfBtnProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? t.accent : t.accentDim,
        border: `1px solid ${t.accent}`,
        borderRadius: 10,
        padding: "14px 20px",
        color: hover ? t.bg : t.accent,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: sans,
        transition: "all 0.15s",
        minHeight: 48,
      }}
    >
      {label} →
    </button>
  );
}
