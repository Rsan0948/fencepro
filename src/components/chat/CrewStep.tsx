import { useState } from "react";
import { ConfBtn } from "../atoms/ConfBtn";
import { Slider } from "../atoms/Slider";

export interface CrewValue {
  employees: number;
  hourlyWage: number;
}

export interface CrewStepProps {
  onConfirm: (value: CrewValue) => void;
}

export function CrewStep({ onConfirm }: CrewStepProps) {
  const [emp, setEmp] = useState(2);
  const [wage, setWage] = useState(22);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Slider
        label="Crew Size"
        min={1}
        max={10}
        step={1}
        value={emp}
        onChange={setEmp}
        format={(v) => `${v} ${v === 1 ? "worker" : "workers"}`}
      />
      <Slider
        label="Hourly Wage"
        min={15}
        max={75}
        step={1}
        value={wage}
        onChange={setWage}
        format={(v) => `$${v}/hr`}
      />
      <ConfBtn
        onClick={() => onConfirm({ employees: emp, hourlyWage: wage })}
        label={`Confirm: ${emp} workers @ $${wage}/hr`}
      />
    </div>
  );
}
