import { t } from "../../theme";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
}

interface Arc {
  dash: number;
  gap: number;
  offset: number;
  color: string;
  label: string;
  value: number;
}

export function DonutChart({ segments, size = 160, stroke = 18 }: DonutChartProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  let offset = 0;
  const arcs: Arc[] = segments.map((seg) => {
    const dash = (seg.value / total) * circ;
    const gap = circ - dash;
    const arc: Arc = { dash, gap, offset, color: seg.color, label: seg.label, value: seg.value };
    offset += dash;
    return arc;
  });
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={t.border}
        strokeWidth={stroke}
      />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={a.color}
          strokeWidth={stroke}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={-a.offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      ))}
    </svg>
  );
}
