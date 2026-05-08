import { useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Topbar } from "./components/nav/Topbar";
import type { EstimateSavePayload } from "./components/projects/EstimateCard";
import { EmailPreviewModal } from "./components/system/EmailPreviewModal";
import { Toast } from "./components/system/Toast";
import type { ToastEntry } from "./components/system/Toast";
import { data } from "./data";
import { fmt } from "./lib/format";
import { loadProjects, saveProjects } from "./lib/storage";
import { Dashboard } from "./screens/Dashboard";
import { FinalInvoiceModal } from "./screens/FinalInvoiceModal";
import { MockCheckout } from "./screens/MockCheckout";
import { NewEstimate } from "./screens/NewEstimate";
import { ProjectDetail } from "./screens/ProjectDetail";
import {
  emailProvider,
  getEmail,
  renderEstimateSent,
  renderFinalInvoice,
  renderPaymentReceipt,
} from "./services/email";
import { getMockSessionRecord, paymentProvider, registerPaymentWebhook } from "./services/payments";
import { sans, t } from "./theme";
import type { Adjustment, Project } from "./types";

type Screen = "dashboard" | "estimate" | "detail";
type Tab = "dashboard" | "estimate";

const FROM_ADDRESS = { email: "noreply@fencepro.demo", name: data.company.name };
const TOAST_CAP = 4;

function buildAbsoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function newInfoToastId(): string {
  return `t_info_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function appendToastCapped(prev: ToastEntry[], next: ToastEntry): ToastEntry[] {
  const combined = [...prev, next];
  return combined.length > TOAST_CAP ? combined.slice(combined.length - TOAST_CAP) : combined;
}

export default function FenceProApp() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [initialLoad] = useState(() => loadProjects(data.projects));
  const [projects, setProjects] = useState<Project[]>(initialLoad.projects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [invoiceProjectId, setInvoiceProjectId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [previewedEmailId, setPreviewedEmailId] = useState<string | null>(null);

  const projectsRef = useRef(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (initialLoad.recovered) {
      setToasts((prev) =>
        appendToastCapped(prev, {
          id: newInfoToastId(),
          kind: "info",
          title: "Saved data was unreadable",
          body: "Loaded the default projects instead.",
        }),
      );
    }
  }, [initialLoad]);

  useEffect(() => {
    function handle(sessionId: string) {
      const record = getMockSessionRecord(sessionId);
      if (!record) return;
      const { projectId, type } = record.input.metadata;
      const today = new Date().toISOString().split("T")[0];
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (type === "deposit") {
            return {
              ...p,
              status: "active",
              depositPaid: record.input.amount,
              checkoutUrl: undefined,
            };
          }
          return {
            ...p,
            status: "paid",
            paidAt: today,
            checkoutUrl: undefined,
          };
        }),
      );
      const project = projectsRef.current.find((p) => p.id === projectId);
      const recipient = project?.clientEmail ?? record.input.customerEmail;
      if (!recipient) return;
      const tpl = renderPaymentReceipt({
        clientName: project?.client ?? "Client",
        companyName: data.company.name,
        amountPaid: fmt(record.input.amount),
        paymentLabel: type === "deposit" ? "Deposit" : "Final balance",
      });
      void emailProvider
        .send({
          to: recipient,
          from: FROM_ADDRESS,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          metadata: { projectId, kind: "payment-receipt" },
        })
        .then((result) => {
          setToasts((prev) =>
            appendToastCapped(prev, {
              id: `t_${result.id}`,
              kind: "email",
              emailId: result.id,
              subject: tpl.subject,
              to: recipient,
            }),
          );
        })
        .catch((err: unknown) => {
          console.error("[fencepro] receipt send failed", err);
          setToasts((prev) =>
            appendToastCapped(prev, {
              id: newInfoToastId(),
              kind: "info",
              title: "Receipt email failed to send",
              body: "The payment was recorded but the receipt did not queue.",
            }),
          );
        });
    }
    return registerPaymentWebhook(handle);
  }, []);

  const selectedProject = selectedProjectId
    ? (projects.find((p) => p.id === selectedProjectId) ?? null)
    : null;
  const invoiceProject = invoiceProjectId
    ? (projects.find((p) => p.id === invoiceProjectId) ?? null)
    : null;
  const previewedMessage = previewedEmailId ? getEmail(previewedEmailId) : null;

  function pushToast(emailId: string, subject: string, to: string) {
    setToasts((prev) =>
      appendToastCapped(prev, { id: `t_${emailId}`, kind: "email", emailId, subject, to }),
    );
  }

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  function openPreview(toast: ToastEntry) {
    if (toast.kind === "email") {
      setPreviewedEmailId(toast.emailId);
    }
  }

  function closePreview() {
    setPreviewedEmailId(null);
  }

  function handleProjectClick(p: Project) {
    setSelectedProjectId(p.id);
    setScreen("detail");
  }

  function handleNewEstimate() {
    setTab("estimate");
    setScreen("estimate");
  }

  async function handleSaveEstimate(payload: EstimateSavePayload) {
    const projectId = `p${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      client: payload.clientName,
      clientEmail: payload.clientEmail,
      county: payload.answers.county ?? "",
      fenceType: payload.answers.fenceType?.id ?? "wood_privacy",
      linearFeet: payload.answers.linearFeet ?? 0,
      heightFt: payload.answers.heightFt ?? 0,
      materialCost: payload.quote.materialCost,
      laborCost: payload.quote.laborCost,
      totalCost: payload.quote.totalCost,
      depositRate: payload.depositPct / 100,
      depositPaid: 0,
      finalPrice: payload.finalPrice,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      paidAt: null,
      adjustments: [],
      notes: "",
    };
    setProjects((prev) => [newProject, ...prev]);

    try {
      const session = await paymentProvider.createCheckoutSession({
        amount: payload.depositAmt,
        currency: "usd",
        description: `Deposit for ${payload.clientName}`,
        customerEmail: payload.clientEmail,
        metadata: { projectId, type: "deposit" },
        successUrl: buildAbsoluteUrl("/"),
        cancelUrl: buildAbsoluteUrl("/"),
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, checkoutUrl: session.url } : p)),
      );
      const tpl = renderEstimateSent({
        clientName: payload.clientName,
        companyName: data.company.name,
        totalAmount: fmt(payload.finalPrice),
        depositAmount: fmt(payload.depositAmt),
        checkoutUrl: buildAbsoluteUrl(session.url),
      });
      const result = await emailProvider.send({
        to: payload.clientEmail,
        from: FROM_ADDRESS,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        metadata: { projectId, kind: "estimate" },
      });
      pushToast(result.id, tpl.subject, payload.clientEmail);
    } catch (err) {
      console.error("[fencepro] estimate send failed", err);
    }
  }

  function handleAddAdjustment(projectId: string, adjustment: Adjustment) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, adjustments: [...p.adjustments, adjustment] } : p,
      ),
    );
  }

  async function handleSendInvoice(project: Project, clientEmail: string) {
    const adjustTotal = project.adjustments.reduce((s, a) => s + a.amount, 0);
    const revisedTotal = project.finalPrice + adjustTotal;
    const remaining = revisedTotal - project.depositPaid;
    try {
      const session = await paymentProvider.createCheckoutSession({
        amount: remaining,
        currency: "usd",
        description: `Final balance for ${project.client}`,
        customerEmail: clientEmail,
        metadata: { projectId: project.id, type: "final" },
        successUrl: buildAbsoluteUrl("/"),
        cancelUrl: buildAbsoluteUrl("/"),
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, checkoutUrl: session.url, clientEmail } : p,
        ),
      );
      const tpl = renderFinalInvoice({
        clientName: project.client,
        companyName: data.company.name,
        totalAmount: fmt(revisedTotal),
        depositPaid: fmt(project.depositPaid),
        remainingAmount: fmt(remaining),
        checkoutUrl: buildAbsoluteUrl(session.url),
      });
      const result = await emailProvider.send({
        to: clientEmail,
        from: FROM_ADDRESS,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        metadata: { projectId: project.id, kind: "final-invoice" },
      });
      pushToast(result.id, tpl.subject, clientEmail);
    } catch (err) {
      console.error("[fencepro] final invoice send failed", err);
    }
  }

  function switchTab(tabName: Tab) {
    setTab(tabName);
    if (tabName === "dashboard") setScreen("dashboard");
    if (tabName === "estimate") setScreen("estimate");
  }

  const mainLayout = (
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
        <FinalInvoiceModal
          project={invoiceProject}
          onClose={() => setInvoiceProjectId(null)}
          onSend={handleSendInvoice}
        />
      )}
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/checkout/:sessionId" element={<MockCheckout />} />
        <Route path="*" element={mainLayout} />
      </Routes>
      <Toast toasts={toasts} onClick={openPreview} onDismiss={dismissToast} />
      <EmailPreviewModal message={previewedMessage} onClose={closePreview} />
    </>
  );
}
