import { mono, t } from "../../theme";
import type { StatusKind } from "../../types";

interface StatusMetaEntry {
  label: string;
  color: string;
  dim: string;
}

const STATUS_META: Record<StatusKind, StatusMetaEntry> = {
  paid: { label: "Paid", color: t.success, dim: t.successDim },
  active: { label: "Active", color: t.warn, dim: t.warnDim },
  pending: { label: "Est. Sent", color: t.info, dim: t.infoDim },
};

export interface StatusBadgeProps {
  status: StatusKind;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      style={{
        background: meta.dim,
        border: `1px solid ${meta.color}33`,
        color: meta.color,
        fontSize: 11,
        fontFamily: mono,
        padding: "3px 8px",
        borderRadius: 6,
        letterSpacing: "0.08em",
      }}
    >
      {meta.label}
    </span>
  );
}
