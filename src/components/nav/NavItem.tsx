import { mono, t } from "../../theme";

export interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function NavItem({ icon, label, active, onClick, compact = false }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: compact ? "8px 12px" : "8px 16px",
        borderRadius: 10,
        transition: "all 0.15s",
        color: active ? t.accent : t.muted,
        minHeight: 44,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {!compact && (
        <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: "0.08em" }}>{label}</span>
      )}
      {active && (
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: t.accent,
            boxShadow: `0 0 6px ${t.accent}`,
          }}
        />
      )}
    </button>
  );
}
