import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { sans, t } from "../../theme";

export interface HoverBtnProps {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  style?: CSSProperties;
}

export function HoverBtn({ children, onClick, primary = false, style }: HoverBtnProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: primary
          ? hover
            ? t.accent
            : t.accentDim
          : hover
            ? t.surfaceHigh
            : "transparent",
        border: `1px solid ${primary ? t.accent : t.border}`,
        color: primary ? (hover ? t.bg : t.accent) : t.sub,
        borderRadius: 10,
        padding: "12px 18px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: sans,
        cursor: "pointer",
        transition: "all 0.15s",
        minHeight: 44,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
