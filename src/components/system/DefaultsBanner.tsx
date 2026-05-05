import { isLocalLoaded } from "../../data";
import { mono, sans, t } from "../../theme";

export function DefaultsBanner() {
  if (isLocalLoaded) return null;
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        color: t.muted,
        fontSize: 12,
        fontFamily: sans,
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: mono,
          color: t.accent,
          letterSpacing: "0.1em",
          fontSize: 10,
        }}
      >
        DEFAULTS
      </span>
      <span>
        Running with default data — drop in src/data/local.ts to customize. See docs/architecture.md
        §Data Layer.
      </span>
    </div>
  );
}
