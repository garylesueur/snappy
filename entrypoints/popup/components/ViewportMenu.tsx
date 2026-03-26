import React, { useState, useRef, useEffect } from "react";
import { VIEWPORT_PRESETS } from "../../../lib/constants";

interface Props {
  onSelect: (width: number, height: number) => void;
  disabled: boolean;
}

export default function ViewportMenu({ onSelect, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="viewport-menu" ref={menuRef}>
      <button
        className="viewport-trigger"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        Viewport ▾
      </button>
      {open && (
        <div className="viewport-dropdown">
          {VIEWPORT_PRESETS.map((p) => (
            <button
              key={p.label}
              className="viewport-option"
              onClick={() => {
                setOpen(false);
                onSelect(p.width, p.height);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
