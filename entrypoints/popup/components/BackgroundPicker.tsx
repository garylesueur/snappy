import React, { useRef, useState } from "react";
import type { BackgroundOption, GradientBackground } from "../../../lib/types";
import { GRADIENT_PRESETS, PLAIN_COLORS } from "../../../lib/constants";

interface Props {
  value: BackgroundOption;
  wallpapers: string[];
  onChange: (v: BackgroundOption) => void;
  onAddWallpaper: (dataUrl: string) => void;
}

function bgMatch(a: BackgroundOption, b: BackgroundOption): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "gradient" && b.type === "gradient")
    return a.stops[0] === b.stops[0] && a.stops[1] === b.stops[1];
  if (a.type === "solid" && b.type === "solid") return a.color === b.color;
  if (a.type === "image" && b.type === "image") return a.dataUrl === b.dataUrl;
  if (a.type === "blurred" && b.type === "blurred") return a.variant === b.variant;
  return a.type === "transparent" && b.type === "transparent";
}

const BLURRED_VARIANTS: {
  variant: "screenshot" | "light" | "dark";
  label: string;
  style: React.CSSProperties;
}[] = [
  {
    variant: "screenshot",
    label: "Screenshot",
    style: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", filter: "blur(0px)" },
  },
  {
    variant: "light",
    label: "Light",
    style: { background: "rgba(240,240,245,1)" },
  },
  {
    variant: "dark",
    label: "Dark",
    style: { background: "#18181b" },
  },
];

export default function BackgroundPicker({
  value,
  wallpapers,
  onChange,
  onAddWallpaper,
}: Props) {
  const [showAllGradients, setShowAllGradients] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleGradients = showAllGradients
    ? GRADIENT_PRESETS
    : GRADIENT_PRESETS.slice(0, 10);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onAddWallpaper(dataUrl);
      onChange({ type: "image", dataUrl });
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="control-group">
      <span className="control-label">Background</span>

      {/* None */}
      <button
        className={`bg-none-btn ${value.type === "transparent" ? "active" : ""}`}
        onClick={() => onChange({ type: "transparent" })}
      >
        None
      </button>

      {/* Gradients */}
      <div className="bg-section-header">
        <span>Gradients</span>
        <button
          className="bg-section-toggle"
          onClick={() => setShowAllGradients(!showAllGradients)}
        >
          {showAllGradients ? "Show less ↑" : "Show more ↓"}
        </button>
      </div>
      <div className="bg-grid">
        {visibleGradients.map((g, i) => (
          <button
            key={i}
            className={`bg-swatch ${bgMatch(value, g) ? "active" : ""}`}
            title={`Gradient ${i + 1}`}
            style={{
              background: `linear-gradient(135deg, ${g.stops[0]}, ${g.stops[1]})`,
            }}
            onClick={() => onChange(g)}
          />
        ))}
      </div>

      {/* Wallpapers */}
      <div className="bg-section-header">
        <span>Wallpapers</span>
      </div>
      <div className="bg-grid">
        {wallpapers.map((dataUrl, i) => (
          <button
            key={i}
            className={`bg-swatch ${value.type === "image" && "dataUrl" in value && value.dataUrl === dataUrl ? "active" : ""}`}
            title={`Wallpaper ${i + 1}`}
            style={{ backgroundImage: `url(${dataUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
            onClick={() => onChange({ type: "image", dataUrl })}
          />
        ))}
        <button
          className="bg-swatch bg-swatch-add"
          title="Add wallpaper"
          onClick={() => fileRef.current?.click()}
        >
          +
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* Blurred */}
      <div className="bg-section-header">
        <span>Blurred</span>
      </div>
      <div className="bg-blurred-row">
        {BLURRED_VARIANTS.map((b) => {
          const isActive =
            value.type === "blurred" && "variant" in value && value.variant === b.variant;
          return (
            <button
              key={b.variant}
              className={`bg-blurred-swatch ${isActive ? "active" : ""}`}
              title={b.label}
              style={b.style}
              onClick={() => onChange({ type: "blurred", variant: b.variant })}
            >
              <span className="bg-blurred-label">{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* Plain color */}
      <div className="bg-section-header">
        <span>Plain color</span>
      </div>
      {PLAIN_COLORS.map((row, rowIdx) => (
        <div key={rowIdx} className="bg-color-row">
          {row.map((color) => (
            <button
              key={color}
              className={`bg-color-dot ${value.type === "solid" && "color" in value && value.color === color ? "active" : ""}`}
              title={color}
              style={{ background: color }}
              onClick={() => onChange({ type: "solid", color })}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
