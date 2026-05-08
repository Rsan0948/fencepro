import { useState } from "react";
import { sans, t } from "../../theme";

export interface ConfBtnProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export function ConfBtn({ onClick, label, disabled = false }: ConfBtnProps) {
  const [hover, setHover] = useState(false);
  const showHover = hover && !disabled;
  return (
    <button
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      style={{
        background: showHover ? t.accent : t.accentDim,
        border: `1px solid ${t.accent}`,
        borderRadius: 10,
        padding: "14px 20px",
        color: showHover ? t.bg : t.accent,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: sans,
        transition: "all 0.15s",
        minHeight: 48,
      }}
    >
      {label} →
    </button>
  );
}
