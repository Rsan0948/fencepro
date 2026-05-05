import { data } from "../../data";
import { mono, t } from "../../theme";
import { NavItem } from "./NavItem";

export type TopbarTab = "dashboard" | "estimate";

export interface TopbarProps {
  tab: TopbarTab;
  onSwitchTab: (tab: TopbarTab) => void;
}

export function Topbar({ tab, onSwitchTab }: TopbarProps) {
  return (
    <div
      style={{
        width: "100%",
        borderBottom: `1px solid ${t.border}`,
        background: t.surface,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: t.accentDim,
            border: `1px solid ${t.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          {"\u{1FAB5}"}
        </div>
        <div>
          <div style={{ color: t.text, fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>
            FencePro
          </div>
          <div
            style={{ color: t.muted, fontSize: 9, fontFamily: mono, letterSpacing: "0.1em" }}
          >
            {data.company.locale.toUpperCase()}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <NavItem
          icon="DSH"
          label="DASH"
          active={tab === "dashboard"}
          onClick={() => onSwitchTab("dashboard")}
        />
        <NavItem
          icon="EST"
          label="ESTIMATE"
          active={tab === "estimate"}
          onClick={() => onSwitchTab("estimate")}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: t.success,
            boxShadow: `0 0 6px ${t.success}`,
          }}
        />
        <span style={{ color: t.muted, fontSize: 11, fontFamily: mono }}>LIVE</span>
      </div>
    </div>
  );
}
