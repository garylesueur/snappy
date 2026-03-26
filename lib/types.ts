export type FrameStyle = "macos" | "minimal" | "browser" | "none";

export interface GradientBackground {
  type: "gradient";
  stops: readonly [string, string];
}

export interface SolidBackground {
  type: "solid";
  color: string;
}

export interface TransparentBackground {
  type: "transparent";
}

export interface ImageBackground {
  type: "image";
  dataUrl: string;
}

export interface BlurredBackground {
  type: "blurred";
  variant: "screenshot" | "light" | "dark";
}

export type BackgroundOption =
  | GradientBackground
  | SolidBackground
  | TransparentBackground
  | ImageBackground
  | BlurredBackground;

export interface ViewportPreset {
  label: string;
  width: number;
  height: number;
}

export interface CompositingOptions {
  frameStyle: FrameStyle;
  background: BackgroundOption;
  padding: number;
  shadowEnabled: boolean;
  shadowBlur: number;
}

export interface AppState {
  screenshotDataUrl: string | null;
  isCapturing: boolean;
  frameStyle: FrameStyle;
  background: BackgroundOption;
  padding: number;
  shadowEnabled: boolean;
  shadowBlur: number;
}

export type AppAction =
  | { type: "CAPTURE_START" }
  | { type: "CAPTURE_SUCCESS"; dataUrl: string }
  | { type: "CAPTURE_FAIL" }
  | { type: "SET_FRAME_STYLE"; frameStyle: FrameStyle }
  | { type: "SET_BACKGROUND"; background: BackgroundOption }
  | { type: "SET_PADDING"; padding: number }
  | { type: "SET_SHADOW_ENABLED"; enabled: boolean }
  | { type: "SET_SHADOW_BLUR"; blur: number }
  | { type: "CLEAR_SCREENSHOT" }
  | { type: "RESTORE_SETTINGS"; settings: SavedSettings };

export interface SavedSettings {
  frameStyle: FrameStyle;
  background: BackgroundOption;
  padding: number;
  shadowEnabled: boolean;
  shadowBlur: number;
}
