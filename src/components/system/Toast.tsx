import { useIsMobile } from "../../lib/useIsMobile";
import { mono, sans, t } from "../../theme";

export type ToastEntry =
  | { id: string; kind: "email"; emailId: string; subject: string; to: string }
  | { id: string; kind: "info"; title: string; body?: string };

export interface ToastProps {
  toasts: ToastEntry[];
  onClick: (toast: ToastEntry) => void;
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onClick, onDismiss }: ToastProps) {
  const isMobile = useIsMobile();
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        left: isMobile ? 16 : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 90,
        maxWidth: isMobile ? "none" : 360,
      }}
    >
      {toasts.map((toast) => {
        const isEmail = toast.kind === "email";
        const tag = isEmail ? "(DEMO) EMAIL SENT" : "(SYSTEM)";
        const title = isEmail ? toast.subject : toast.title;
        const subtitle = isEmail
          ? `to ${toast.to} · click to preview`
          : (toast.body ?? "click to dismiss");
        return (
          <div
            key={toast.id}
            onClick={() => onClick(toast)}
            style={{
              background: t.surfaceHigh,
              border: `1px solid ${t.accent}`,
              borderRadius: 12,
              padding: "12px 14px",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              animation: "fadeSlideUp 0.25s ease",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: t.accent,
                  fontSize: 9,
                  fontFamily: mono,
                  letterSpacing: "0.14em",
                  marginBottom: 4,
                }}
              >
                {tag}
              </div>
              <div
                style={{
                  color: t.text,
                  fontSize: 13,
                  fontFamily: sans,
                  fontWeight: 600,
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  color: t.muted,
                  fontSize: 11,
                  fontFamily: mono,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              aria-label="Dismiss"
              style={{
                background: "transparent",
                border: "none",
                color: t.muted,
                fontSize: 18,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
