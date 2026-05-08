import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChatBubble } from "../components/chat/ChatBubble";
import { CountyPicker } from "../components/chat/CountyPicker";
import { CrewStep } from "../components/chat/CrewStep";
import type { CrewValue } from "../components/chat/CrewStep";
import { DimensionsStep } from "../components/chat/DimensionsStep";
import type { DimensionsValue } from "../components/chat/DimensionsStep";
import { FencePicker } from "../components/chat/FencePicker";
import { TypingDots } from "../components/chat/TypingDots";
import { EstimateCard } from "../components/projects/EstimateCard";
import type { EstimateSavePayload } from "../components/projects/EstimateCard";
import { data } from "../data";
import { calcQuote } from "../lib/quote";
import { useIsMobile } from "../lib/useIsMobile";
import { mono, t } from "../theme";
import type { EstimateAnswers, FenceType, Quote } from "../types";

type StageId = "county" | "fenceType" | "dimensions" | "crew";
type StageValue = string | FenceType | DimensionsValue | CrewValue;
type StageNext = (value: StageValue, summary: string) => void;

interface Stage {
  id: StageId;
  msg: string;
  render: (next: StageNext) => ReactNode;
}

const STAGES: Stage[] = [
  {
    id: "county",
    msg: "Hey! Let's build your estimate. Which county is the project in?",
    render: (next) => (
      <CountyPicker counties={data.counties} onSelect={(v) => next(v, `${v} County`)} />
    ),
  },
  {
    id: "fenceType",
    msg: "Great. What type of fence are you building?",
    render: (next) => (
      <FencePicker fenceTypes={data.fenceTypes} onSelect={(v) => next(v, v.label)} />
    ),
  },
  {
    id: "dimensions",
    msg: "How long is the run and how tall?",
    render: (next) => (
      <DimensionsStep onConfirm={(v) => next(v, `${v.linearFeet} ft x ${v.heightFt} ft`)} />
    ),
  },
  {
    id: "crew",
    msg: "Tell me about your crew - how many people and what do you pay them?",
    render: (next) => (
      <CrewStep onConfirm={(v) => next(v, `${v.employees} workers @ $${v.hourlyWage}/hr`)} />
    ),
  },
];

interface ChatMessage {
  role: "bot" | "user";
  content?: ReactNode;
  summary?: string;
}

interface EstimateState {
  data: Quote;
  answers: EstimateAnswers;
}

export interface NewEstimateProps {
  onSave: (payload: EstimateSavePayload) => void;
}

export function NewEstimate({ onSave }: NewEstimateProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<EstimateAnswers>({});
  const [typing, setTyping] = useState(false);
  const [estimate, setEstimate] = useState<EstimateState | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      setMessages([{ role: "bot", content: STAGES[0].msg }]);
    }, 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, estimate]);

  function handleAnswer(stageId: StageId, value: StageValue, summary: string) {
    const ans: EstimateAnswers = { ...answers };
    if (stageId === "county" && typeof value === "string") {
      ans.county = value;
    } else if (stageId === "fenceType" && isFenceType(value)) {
      ans.fenceType = value;
    } else if (stageId === "dimensions" && isDimensionsValue(value)) {
      ans.linearFeet = value.linearFeet;
      ans.heightFt = value.heightFt;
    } else if (stageId === "crew" && isCrewValue(value)) {
      ans.employees = value.employees;
      ans.hourlyWage = value.hourlyWage;
    }
    setAnswers(ans);
    setMessages((p) => [...p, { role: "user", summary }]);
    const next = stage + 1;
    if (next < STAGES.length) {
      setStage(next);
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        setMessages((p) => [...p, { role: "bot", content: STAGES[next].msg }]);
        setRenderKey((k) => k + 1);
      }, 800);
    } else {
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        const q = calcQuote({
          fenceType: ans.fenceType?.id ?? "wood_privacy",
          linearFeet: ans.linearFeet ?? 0,
          heightFt: ans.heightFt ?? 0,
          employees: ans.employees ?? 0,
          hourlyWage: ans.hourlyWage ?? 0,
          county: ans.county ?? "default",
        });
        setEstimate({ data: q, answers: ans });
        setMessages((p) => [
          ...p,
          {
            role: "bot",
            content:
              "Here's your estimate. Set your margin, choose a deposit structure, then send it to your client.",
          },
        ]);
      }, 1200);
    }
  }

  const curStage = STAGES[stage];
  const showInlinePanel = !estimate && !typing && curStage;
  const tailPadding = estimate ? 40 : isMobile ? 16 : 140;

  return (
    <div style={{ paddingBottom: tailPadding }}>
      {messages.map((m, i) => (
        <ChatBubble key={i} role={m.role} content={m.content} summary={m.summary} />
      ))}
      {typing && (
        <div style={{ display: "flex", marginBottom: 16 }}>
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "4px 20px 20px 20px",
            }}
          >
            <TypingDots />
          </div>
        </div>
      )}
      {estimate && !typing && (
        <div style={{ marginTop: 8, marginBottom: 24 }}>
          <EstimateCard quote={estimate.data} answers={estimate.answers} onSave={onSave} />
        </div>
      )}
      {showInlinePanel && isMobile && (
        <div style={{ marginTop: 8, marginBottom: 16 }} key={renderKey}>
          {curStage.render((v, s) => handleAnswer(curStage.id, v, s))}
        </div>
      )}
      <div ref={bottomRef} />
      {showInlinePanel && !isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(to top,${t.bg} 60%,transparent)`,
            padding: "24px 0 28px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 640, padding: "0 24px" }} key={renderKey}>
            {curStage.render((v, s) => handleAnswer(curStage.id, v, s))}
          </div>
        </div>
      )}
      {estimate && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button
            onClick={() => {
              setMessages([]);
              setAnswers({});
              setEstimate(null);
              setStage(0);
              setRenderKey((k) => k + 1);
              setTyping(true);
              window.setTimeout(() => {
                setTyping(false);
                setMessages([{ role: "bot", content: STAGES[0].msg }]);
              }, 600);
            }}
            style={{
              background: "transparent",
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              padding: "12px 20px",
              color: t.muted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: mono,
              letterSpacing: "0.1em",
              transition: "all 0.15s",
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = t.accent;
              e.currentTarget.style.color = t.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = t.border;
              e.currentTarget.style.color = t.muted;
            }}
          >
            ↺ NEW ESTIMATE
          </button>
        </div>
      )}
    </div>
  );
}

function isFenceType(value: StageValue): value is FenceType {
  return typeof value === "object" && value !== null && "id" in value && "label" in value;
}

function isDimensionsValue(value: StageValue): value is DimensionsValue {
  return (
    typeof value === "object" && value !== null && "linearFeet" in value && "heightFt" in value
  );
}

function isCrewValue(value: StageValue): value is CrewValue {
  return (
    typeof value === "object" && value !== null && "employees" in value && "hourlyWage" in value
  );
}
