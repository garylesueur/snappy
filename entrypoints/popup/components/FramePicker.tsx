import React from "react";
import type { FrameStyle } from "../../../lib/types";

const FRAMES: { value: FrameStyle; label: string }[] = [
  { value: "macos", label: "macOS" },
  { value: "browser", label: "Browser" },
  { value: "minimal", label: "Minimal" },
  { value: "none", label: "None" },
];

interface Props {
  value: FrameStyle;
  onChange: (v: FrameStyle) => void;
}

export default function FramePicker({ value, onChange }: Props) {
  return (
    <div className="control-group">
      <span className="control-label">Frame</span>
      <div className="segmented">
        {FRAMES.map((f) => (
          <button
            key={f.value}
            className={value === f.value ? "active" : ""}
            onClick={() => onChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
