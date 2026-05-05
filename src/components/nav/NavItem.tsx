import { mono, t } from "../../theme";

export interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "8px 16px",
        borderRadius: 10,
        transition: "all 0.15s",
        color: active ? t.accent : t.muted,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: "0.08em" }}>{label}</span>
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
