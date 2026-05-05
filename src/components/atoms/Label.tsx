import type { ReactNode } from "react";
import { mono, t } from "../../theme";

export interface LabelProps {
  children: ReactNode;
}

export function Label({ children }: LabelProps) {
  return (
    <div
      style={{
        color: t.muted,
        fontSize: 10,
        fontFamily: mono,
        letterSpacing: "0.12em",
        marginBottom: 6,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}
