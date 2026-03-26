import React from "react";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function PaddingSlider({ value, onChange }: Props) {
  return (
    <div className="control-group">
      <span className="control-label">Padding</span>
      <div className="slider-row">
        <input
          type="range"
          min={0}
          max={128}
          step={4}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="slider-value">{value}px</span>
      </div>
    </div>
  );
}
