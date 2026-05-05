import { useEffect, useState } from "react";
import { Topbar } from "./components/nav/Topbar";
import type { EstimateSavePayload } from "./components/projects/EstimateCard";
import { data } from "./data";
import { loadProjects, saveProjects } from "./lib/storage";
import { Dashboard } from "./screens/Dashboard";
import { FinalInvoiceModal } from "./screens/FinalInvoiceModal";
import { NewEstimate } from "./screens/NewEstimate";
import { ProjectDetail } from "./screens/ProjectDetail";
import { sans, t } from "./theme";
import type { Adjustment, Project } from "./types";

type Screen = "dashboard" | "estimate" | "detail";
type Tab = "dashboard" | "estimate";

export default function FenceProApp() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [projects, setProjects] = useState<Project[]>(() => loadProjects(data.projects));
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [invoiceProjectId, setInvoiceProjectId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const selectedProject = selectedProjectId
    ? (projects.find((p) => p.id === selectedProjectId) ?? null)
    : null;
  const invoiceProject = invoiceProjectId
    ? (projects.find((p) => p.id === invoiceProjectId) ?? null)
    : null;

  function handleProjectClick(p: Project) {
    setSelectedProjectId(p.id);
    setScreen("detail");
  }

  function handleNewEstimate() {
    setTab("estimate");
    setScreen("estimate");
  }

  function handleSaveEstimate(payload: EstimateSavePayload) {
    const newProject: Project = {
      id: `p${Date.now()}`,
      client: payload.clientName,
      county: payload.answers.county ?? "",
      fenceType: payload.answers.fenceType?.id ?? "wood_privacy",
      linearFeet: payload.answers.linearFeet ?? 0,
      heightFt: payload.answers.heightFt ?? 0,
      materialCost: payload.quote.materialCost,
      laborCost: payload.quote.laborCost,
      totalCost: payload.quote.totalCost,
      depositRate: payload.depositPct / 100,
      depositPaid: payload.depositAmt,
      finalPrice: payload.finalPrice,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      paidAt: null,
      adjustments: [],
      notes: "",
    };
    setProjects((prev) => [newProject, ...prev]);
  }

  function handleAddAdjustment(projectId: string, adjustment: Adjustment) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, adjustments: [...p.adjustments, adjustment] } : p,
      ),
    );
  }

  function switchTab(tabName: Tab) {
    setTab(tabName);
    if (tabName === "dashboard") setScreen("dashboard");
    if (tabName === "estimate") setScreen("estimate");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: sans,
      }}
    >
      <Topbar tab={tab} onSwitchTab={switchTab} />
      <div
        style={{
          flex: 1,
          maxWidth: 820,
          width: "100%",
          margin: "0 auto",
          padding: "28px 24px 0",
          overflowY: "auto",
        }}
      >
        {screen === "dashboard" && (
          <Dashboard
            projects={projects}
            onProjectClick={handleProjectClick}
            onNewEstimate={handleNewEstimate}
          />
        )}
        {screen === "estimate" && <NewEstimate onSave={handleSaveEstimate} />}
        {screen === "detail" && selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onBack={() => {
              setScreen("dashboard");
              setTab("dashboard");
            }}
            onInvoice={(p) => setInvoiceProjectId(p.id)}
            onAddAdjustment={handleAddAdjustment}
          />
        )}
      </div>

      {invoiceProject && (
        <FinalInvoiceModal project={invoiceProject} onClose={() => setInvoiceProjectId(null)} />
      )}
    </div>
  );
}
