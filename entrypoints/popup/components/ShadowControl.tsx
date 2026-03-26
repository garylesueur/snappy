import React from "react";

interface Props {
  enabled: boolean;
  blur: number;
  onToggle: (v: boolean) => void;
  onBlurChange: (v: number) => void;
}

export default function ShadowControl({
  enabled,
  blur,
  onToggle,
  onBlurChange,
}: Props) {
  return (
    <div className="control-group">
      <div className="toggle-row">
        <span className="control-label">Shadow</span>
        <button
          className={`toggle ${enabled ? "active" : ""}`}
          onClick={() => onToggle(!enabled)}
        />
      </div>
      {enabled && (
        <div className="slider-row">
          <input
            type="range"
            min={4}
            max={60}
            step={2}
            value={blur}
            onChange={(e) => onBlurChange(Number(e.target.value))}
          />
          <span className="slider-value">{blur}</span>
        </div>
      )}
    </div>
  );
}
