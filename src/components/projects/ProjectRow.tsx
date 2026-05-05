import { useState } from "react";
import { Link } from "react-router-dom";
import { fenceLabel, fmt, fmtD } from "../../lib/format";
import { mono, sans, t } from "../../theme";
import type { Project } from "../../types";
import { StatusBadge } from "../atoms/StatusBadge";

export interface ProjectRowProps {
  project: Project;
  onClick: () => void;
  last: boolean;
}

export function ProjectRow({ project, onClick, last }: ProjectRowProps) {
  const [hov, setHov] = useState(false);
  const total = project.finalPrice + project.adjustments.reduce((s, a) => s + a.amount, 0);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 0.6fr",
        gap: 0,
        padding: "13px 20px",
        borderBottom: last ? "none" : `1px solid ${t.border}`,
        background: hov ? t.surfaceHigh : "transparent",
        cursor: "pointer",
        transition: "background 0.12s",
        alignItems: "center",
      }}
    >
      <div style={{ color: t.text, fontSize: 14, fontFamily: sans, fontWeight: 500 }}>
        {project.client}
      </div>
      <div style={{ color: t.sub, fontSize: 13, fontFamily: sans }}>
        {fenceLabel(project.fenceType)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ color: t.text, fontSize: 13, fontFamily: mono }}>{fmt(total)}</span>
        {project.checkoutUrl && (
          <Link
            to={project.checkoutUrl}
            onClick={(e) => e.stopPropagation()}
            style={{
              color: t.muted,
              fontSize: 10,
              fontFamily: mono,
              letterSpacing: "0.06em",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            (demo) simulate payment →
          </Link>
        )}
      </div>
      <StatusBadge status={project.status} />
      <div style={{ color: t.muted, fontSize: 12, fontFamily: mono }}>
        {fmtD(project.createdAt)}
      </div>
      <div style={{ color: t.muted, fontSize: 12, textAlign: "right" }}>→</div>
    </div>
  );
}
