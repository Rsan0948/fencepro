import { useCallback, useEffect, useRef, useState } from "react";
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
      <CrewStep
        onConfirm={(v) => {
          const totalHeadcount = v.members.reduce((s, m) => s + m.count, 0);
          const summary =
            v.members.length === 1
              ? `${v.members[0].count} ${v.members[0].count === 1 ? "worker" : "workers"} @ $${v.members[0].hourlyWage}/hr × ${v.members[0].hours} hrs`
              : `${totalHeadcount} workers across ${v.members.length} tiers`;
          next(v, summary);
        }}
      />
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
  const timersRef = useRef<Set<number>>(new Set());

  // Chat-delay timers scheduled from event handlers; cleared on unmount so
  // a tab switch mid-conversation doesn't leave orphaned callbacks running.
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    setTyping(true);
    schedule(() => {
      setTyping(false);
      setMessages([{ role: "bot", content: STAGES[0].msg }]);
    }, 900);
  }, [schedule]);

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
      ans.crew = value.members;
    }
    setAnswers(ans);
    setMessages((p) => [...p, { role: "user", summary }]);
    const next = stage + 1;
    if (next < STAGES.length) {
      setStage(next);
      setTyping(true);
      schedule(() => {
        setTyping(false);
        setMessages((p) => [...p, { role: "bot", content: STAGES[next].msg }]);
        setRenderKey((k) => k + 1);
      }, 800);
    } else {
      setTyping(true);
      schedule(() => {
        setTyping(false);
        const q = calcQuote({
          fenceType: ans.fenceType?.id ?? "wood_privacy",
          linearFeet: ans.linearFeet ?? 0,
          heightFt: ans.heightFt ?? 0,
          crew: ans.crew ?? [{ count: 1, hourlyWage: 20, hours: 8 }],
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
  const tailPadding = estimate ? 40 : 16;

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
      {showInlinePanel && (
        <div style={{ marginTop: 24, marginBottom: 16 }} key={renderKey}>
          {curStage.render((v, s) => handleAnswer(curStage.id, v, s))}
        </div>
      )}
      <div ref={bottomRef} />
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
              schedule(() => {
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
  if (typeof value !== "object" || value === null) return false;
  if (!("members" in value)) return false;
  const candidate = (value as { members: unknown }).members;
  return Array.isArray(candidate);
}
