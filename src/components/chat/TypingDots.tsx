import { t } from "../../theme";

export function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: t.accent,
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
