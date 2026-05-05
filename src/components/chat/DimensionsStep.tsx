import { useState } from "react";
import { ConfBtn } from "../atoms/ConfBtn";
import { Slider } from "../atoms/Slider";

export interface DimensionsValue {
  linearFeet: number;
  heightFt: number;
}

export interface DimensionsStepProps {
  onConfirm: (value: DimensionsValue) => void;
}

export function DimensionsStep({ onConfirm }: DimensionsStepProps) {
  const [lf, setLf] = useState(100);
  const [h, setH] = useState(6);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Slider label="Linear Feet" min={20} max={1000} step={10} value={lf} onChange={setLf} />
      <Slider
        label="Height"
        min={3}
        max={8}
        step={1}
        value={h}
        onChange={setH}
        format={(v) => `${v} ft`}
      />
      <ConfBtn
        onClick={() => onConfirm({ linearFeet: lf, heightFt: h })}
        label={`Confirm: ${lf} ft x ${h} ft tall`}
      />
    </div>
  );
}
