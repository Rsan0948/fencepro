import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { sans, t } from "../../theme";

export interface HoverBtnProps {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}

export function HoverBtn({
  children,
  onClick,
  primary = false,
  disabled = false,
  style,
}: HoverBtnProps) {
  const [hover, setHover] = useState(false);
  const activeHover = hover && !disabled;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: disabled
          ? t.surface
          : primary
            ? activeHover
              ? t.accent
              : t.accentDim
            : activeHover
              ? t.surfaceHigh
              : "transparent",
        border: `1px solid ${disabled ? t.border : primary ? t.accent : t.border}`,
        color: disabled ? t.muted : primary ? (activeHover ? t.bg : t.accent) : t.sub,
        borderRadius: 10,
        padding: "12px 18px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: sans,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s",
        minHeight: 44,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
