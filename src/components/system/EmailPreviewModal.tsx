import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../lib/useIsMobile";
import type { MockEmailMessage } from "../../services/email";
import { mono, sans, t } from "../../theme";

export interface EmailPreviewModalProps {
  message: MockEmailMessage | null;
  onClose: () => void;
}

export function EmailPreviewModal({ message, onClose }: EmailPreviewModalProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  if (!message) return null;

  function handleHtmlClick(e: MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href) return;
    let target: URL;
    try {
      target = new URL(href, window.location.origin);
    } catch {
      return;
    }
    if (target.origin !== window.location.origin) return;
    e.preventDefault();
    onClose();
    navigate(`${target.pathname}${target.search}${target.hash}`);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,8,13,0.85)",
        display: "flex",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "center",
        zIndex: 110,
        padding: isMobile ? 16 : 20,
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
          maxHeight: isMobile ? "100%" : "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeSlideUp 0.3s ease",
        }}
      >
        <div
          style={{
            padding: isMobile ? "14px 16px" : "18px 22px",
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
            <div
              style={{
                color: t.muted,
                fontSize: 12,
                fontFamily: mono,
                wordBreak: "break-word",
              }}
            >
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
              minWidth: 44,
              minHeight: 44,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <div
          onClick={handleHtmlClick}
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
