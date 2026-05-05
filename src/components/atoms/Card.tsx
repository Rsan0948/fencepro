import type { CSSProperties, ReactNode } from "react";
import { t } from "../../theme";

export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
