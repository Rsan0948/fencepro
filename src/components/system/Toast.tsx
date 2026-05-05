import { mono, sans, t } from "../../theme";

export interface ToastEntry {
  id: string;
  emailId: string;
  subject: string;
  to: string;
}

export interface ToastProps {
  toasts: ToastEntry[];
  onClick: (toast: ToastEntry) => void;
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onClick, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 90,
        maxWidth: 360,
      }}
    >
      {toasts.map((toast) => (
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
              (DEMO) EMAIL SENT
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
              {toast.subject}
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
              to {toast.to} · click to preview
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
              fontSize: 16,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
