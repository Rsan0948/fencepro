import type { ReactNode } from "react";
import { mono, sans, t } from "../../theme";

export type ChatRole = "bot" | "user";

export interface ChatBubbleProps {
  role: ChatRole;
  content?: ReactNode;
  summary?: string;
}

export function ChatBubble({ role, content, summary }: ChatBubbleProps) {
  const bot = role === "bot";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: bot ? "flex-start" : "flex-end",
        marginBottom: 16,
        animation: "fadeSlideUp 0.35s ease",
      }}
    >
      {bot && (
        <div
          style={{
            fontSize: 10,
            color: t.muted,
            marginBottom: 4,
            letterSpacing: "0.12em",
            fontFamily: mono,
          }}
        >
          FENCEPRO AI
        </div>
      )}
      <div
        style={{
          maxWidth: "78%",
          background: bot ? t.surface : t.accentDim,
          border: `1px solid ${bot ? t.border : t.accent}`,
          borderRadius: bot ? "4px 20px 20px 20px" : "20px 4px 20px 20px",
          padding: "12px 18px",
          color: bot ? t.text : t.accent,
          fontSize: 15,
          fontFamily: sans,
          lineHeight: 1.6,
        }}
      >
        {summary ? (
          <span style={{ color: t.sub, fontSize: 13 }}>
            <span style={{ color: t.accent, marginRight: 6 }}>✓</span>
            {summary}
          </span>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
