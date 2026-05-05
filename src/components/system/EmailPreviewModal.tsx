import type { MockEmailMessage } from "../../services/email";
import { mono, sans, t } from "../../theme";

export interface EmailPreviewModalProps {
  message: MockEmailMessage | null;
  onClose: () => void;
}

export function EmailPreviewModal({ message, onClose }: EmailPreviewModalProps) {
  if (!message) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,8,13,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 110,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.surface,
          border: `1px solid ${t.accent}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeSlideUp 0.3s ease",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: t.accent,
                fontSize: 10,
                fontFamily: mono,
                letterSpacing: "0.14em",
                marginBottom: 4,
              }}
            >
              (DEMO) EMAIL PREVIEW
            </div>
            <div
              style={{
                color: t.text,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: sans,
                marginBottom: 6,
              }}
            >
              {message.subject}
            </div>
            <div style={{ color: t.muted, fontSize: 12, fontFamily: mono }}>
              From {message.from.name} &lt;{message.from.email}&gt; → {message.to}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            style={{
              background: "transparent",
              border: "none",
              color: t.muted,
              fontSize: 22,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f5f5f0",
          }}
          dangerouslySetInnerHTML={{ __html: message.html }}
        />
      </div>
    </div>
  );
}
