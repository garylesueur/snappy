import type { ViewportPreset, GradientBackground } from "./types";

export const VIEWPORT_PRESETS: ViewportPreset[] = [
  { label: "1920 × 1080 (16:9 Full HD)", width: 1920, height: 1080 },
  { label: "1280 × 720 (16:9 HD)", width: 1280, height: 720 },
  { label: "1440 × 900 (16:10)", width: 1440, height: 900 },
  { label: "1024 × 768 (4:3)", width: 1024, height: 768 },
  { label: "1280 × 800 (MacBook)", width: 1280, height: 800 },
  { label: "390 × 844 (iPhone 14)", width: 390, height: 844 },
  { label: "360 × 800 (Android)", width: 360, height: 800 },
];

export const GRADIENT_PRESETS: GradientBackground[] = [
  // Row 1 — warm
  { type: "gradient", stops: ["#ff9a9e", "#fad0c4"] },
  { type: "gradient", stops: ["#f6d365", "#fda085"] },
  { type: "gradient", stops: ["#f093fb", "#f5576c"] },
  { type: "gradient", stops: ["#ffecd2", "#fcb69f"] },
  { type: "gradient", stops: ["#ff8177", "#b12a5b"] },
  // Row 2 — cool
  { type: "gradient", stops: ["#4facfe", "#00f2fe"] },
  { type: "gradient", stops: ["#43e97b", "#38f9d7"] },
  { type: "gradient", stops: ["#667eea", "#764ba2"] },
  { type: "gradient", stops: ["#a1c4fd", "#c2e9fb"] },
  { type: "gradient", stops: ["#84fab0", "#8fd3f4"] },
  // Row 3 — vivid
  { type: "gradient", stops: ["#6a11cb", "#2575fc"] },
  { type: "gradient", stops: ["#ee0979", "#ff6a00"] },
  { type: "gradient", stops: ["#fc4a1a", "#f7b733"] },
  { type: "gradient", stops: ["#11998e", "#38ef7d"] },
  { type: "gradient", stops: ["#c94b4b", "#4b134f"] },
  // Row 4 — dark / muted
  { type: "gradient", stops: ["#141e30", "#243b55"] },
  { type: "gradient", stops: ["#2b5876", "#4e4376"] },
  { type: "gradient", stops: ["#373b44", "#4286f4"] },
  { type: "gradient", stops: ["#0f2027", "#203a43"] },
  { type: "gradient", stops: ["#232526", "#414345"] },
];

export const PLAIN_COLORS: string[][] = [
  // Row 1 — saturated
  ["#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"],
  // Row 2 — muted / pastel
  ["#374151", "#d1d5db", "#fca5a5", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#c4b5fd", "#f9a8d4"],
];

export const MAX_WALLPAPERS = 5;
export const DEFAULT_PADDING = 64;
export const DEFAULT_SHADOW_BLUR = 20;
