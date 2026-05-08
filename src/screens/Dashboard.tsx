import { useState } from "react";
import { Card } from "../components/atoms/Card";
import { HoverBtn } from "../components/atoms/HoverBtn";
import { Label } from "../components/atoms/Label";
import { DonutChart } from "../components/charts/DonutChart";
import type { DonutSegment } from "../components/charts/DonutChart";
import { ProjectRow } from "../components/projects/ProjectRow";
import { DefaultsBanner } from "../components/system/DefaultsBanner";
import { data } from "../data";
import { fmt } from "../lib/format";
import { useIsMobile } from "../lib/useIsMobile";
import { mono, sans, t } from "../theme";
import type { Project } from "../types";

export interface DashboardProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onNewEstimate: () => void;
}

export function Dashboard({ projects, onProjectClick, onNewEstimate }: DashboardProps) {
  const [tableExpanded, setTableExpanded] = useState(false);
  const isMobile = useIsMobile();

  const currentYear = new Date().getFullYear();
  const ytd = projects.filter((p) => new Date(p.createdAt).getFullYear() === currentYear);

  const totalRevenue = ytd.reduce((s, p) => s + (p.status === "paid" ? p.finalPrice : 0), 0);
  const activeRevenue = ytd
    .filter((p) => p.status === "active")
    .reduce((s, p) => s + p.finalPrice, 0);
  const pendingRevenue = ytd
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.finalPrice, 0);
  const depositsPaid = ytd.reduce((s, p) => s + (p.depositPaid || 0), 0);
  const adjustmentsTotal = ytd.reduce(
    (s, p) => s + p.adjustments.reduce((a, j) => a + j.amount, 0),
    0,
  );

  const paidCount = ytd.filter((p) => p.status === "paid").length;
  const activeCount = ytd.filter((p) => p.status === "active").length;
  const pendingCount = ytd.filter((p) => p.status === "pending").length;

  const donutSegs: DonutSegment[] = [
    { label: "Paid", value: totalRevenue, color: t.success },
    { label: "Active", value: activeRevenue, color: t.warn },
    { label: "Pending", value: pendingRevenue, color: t.info },
  ];

  const totalDonut = totalRevenue + activeRevenue + pendingRevenue || 1;
  const displayProjects = tableExpanded ? ytd : ytd.slice(0, 4);
  const donutSize = isMobile ? 110 : 140;
  const donutStroke = isMobile ? 13 : 16;

  return (
    <div style={{ padding: "0 0 40px" }}>
      <DefaultsBanner />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 28,
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: t.muted,
              fontSize: 11,
              fontFamily: mono,
              letterSpacing: "0.12em",
              marginBottom: 4,
            }}
          >
            GOOD MORNING
          </div>
          <h1
            style={{
              color: t.text,
              fontSize: isMobile ? 22 : 28,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              fontFamily: sans,
            }}
          >
            {data.company.name}
          </h1>
        </div>
        <HoverBtn primary onClick={onNewEstimate}>
          + New Estimate
        </HoverBtn>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <Label>Account Overview</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 8 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <DonutChart segments={donutSegs} size={donutSize} stroke={donutStroke} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ color: t.text, fontSize: 16, fontWeight: 700, fontFamily: mono }}>
                  {ytd.length}
                </div>
                <div
                  style={{ color: t.muted, fontSize: 9, fontFamily: mono, letterSpacing: "0.1em" }}
                >
                  JOBS
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0 }}>
              {[
                { label: "Paid", color: t.success, count: paidCount, rev: totalRevenue },
                { label: "Active", color: t.warn, count: activeCount, rev: activeRevenue },
                { label: "Pending", color: t.info, count: pendingCount, rev: pendingRevenue },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, gap: 8 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: s.color,
                          boxShadow: `0 0 6px ${s.color}`,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: t.sub, fontSize: 12, fontFamily: sans }}>
                        {s.label} ({s.count})
                      </span>
                    </div>
                    <span style={{ color: s.color, fontSize: 12, fontFamily: mono }}>
                      {fmt(s.rev)}
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: t.border }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        background: s.color,
                        width: `${(s.rev / totalDonut) * 100}%`,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <Label>Revenue YTD - {currentYear}</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            {[
              { label: "Collected", value: totalRevenue + depositsPaid, color: t.success },
              {
                label: "Outstanding",
                value: activeRevenue + pendingRevenue - depositsPaid,
                color: t.warn,
              },
              { label: "Deposits In", value: depositsPaid, color: t.info },
              { label: "Adjustments", value: adjustmentsTotal, color: t.accent },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: t.bgAlt,
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    color: t.muted,
                    fontSize: 9,
                    fontFamily: mono,
                    letterSpacing: "0.12em",
                    marginBottom: 6,
                  }}
                >
                  {s.label.toUpperCase()}
                </div>
                <div
                  style={{
                    color: s.color,
                    fontSize: isMobile ? 16 : 20,
                    fontWeight: 700,
                    fontFamily: mono,
                  }}
                >
                  {fmt(s.value)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ padding: 0 }}>
        <div
          style={{
            padding: "16px 20px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <Label>Projects {currentYear}</Label>
          <button
            onClick={() => setTableExpanded((e) => !e)}
            style={{
              background: "transparent",
              border: "none",
              color: t.sub,
              fontSize: 12,
              fontFamily: mono,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            {tableExpanded ? "COLLAPSE ↑" : "EXPAND ↓"} ({ytd.length} jobs)
          </button>
        </div>

        {!isMobile && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 0.6fr",
              gap: 0,
              padding: "8px 20px",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            {["Client", "Type", "Amount", "Status", "Date", ""].map((h) => (
              <div
                key={h || "actions"}
                style={{ color: t.muted, fontSize: 10, fontFamily: mono, letterSpacing: "0.1em" }}
              >
                {h}
              </div>
            ))}
          </div>
        )}

        {displayProjects.map((p, i) => (
          <ProjectRow
            key={p.id}
            project={p}
            last={i === displayProjects.length - 1}
            onClick={() => onProjectClick(p)}
          />
        ))}

        {!tableExpanded && ytd.length > 4 && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: `1px solid ${t.border}`,
              textAlign: "center",
            }}
          >
            <button
              onClick={() => setTableExpanded(true)}
              style={{
                background: "transparent",
                border: "none",
                color: t.muted,
                fontSize: 12,
                fontFamily: mono,
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              +{ytd.length - 4} MORE PROJECTS
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
