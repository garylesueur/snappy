import React, { useReducer, useRef, useCallback, useEffect, useState } from "react";
import type { AppState, AppAction, SavedSettings } from "../../lib/types";
import { DEFAULT_PADDING, DEFAULT_SHADOW_BLUR, MAX_WALLPAPERS } from "../../lib/constants";
import { sendMessage } from "../../lib/messaging";
import { loadSettings, saveSettings, loadWallpapers, saveWallpapers } from "../../lib/storage";
import PreviewCanvas from "./components/PreviewCanvas";
import FramePicker from "./components/FramePicker";
import BackgroundPicker from "./components/BackgroundPicker";
import ViewportMenu from "./components/ViewportMenu";
import PaddingSlider from "./components/PaddingSlider";
import ShadowControl from "./components/ShadowControl";
import ActionButtons from "./components/ActionButtons";

const initialState: AppState = {
  screenshotDataUrl: null,
  isCapturing: false,
  frameStyle: "browser",
  background: { type: "gradient", stops: ["#667eea", "#764ba2"] },
  padding: DEFAULT_PADDING,
  shadowEnabled: true,
  shadowBlur: DEFAULT_SHADOW_BLUR,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "CAPTURE_START":
      return { ...state, isCapturing: true };
    case "CAPTURE_SUCCESS":
      return { ...state, isCapturing: false, screenshotDataUrl: action.dataUrl };
    case "CAPTURE_FAIL":
      return { ...state, isCapturing: false };
    case "SET_FRAME_STYLE":
      return { ...state, frameStyle: action.frameStyle };
    case "SET_BACKGROUND":
      return { ...state, background: action.background };
    case "SET_PADDING":
      return { ...state, padding: action.padding };
    case "SET_SHADOW_ENABLED":
      return { ...state, shadowEnabled: action.enabled };
    case "SET_SHADOW_BLUR":
      return { ...state, shadowBlur: action.blur };
    case "CLEAR_SCREENSHOT":
      return { ...state, screenshotDataUrl: null };
    case "RESTORE_SETTINGS":
      return {
        ...state,
        frameStyle: action.settings.frameStyle,
        background: action.settings.background,
        padding: action.settings.padding,
        shadowEnabled: action.settings.shadowEnabled,
        shadowBlur: action.settings.shadowBlur,
      };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [wallpapers, setWallpapers] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved settings + wallpapers on mount
  useEffect(() => {
    loadSettings().then((saved) => {
      if (saved) dispatch({ type: "RESTORE_SETTINGS", settings: saved });
    });
    loadWallpapers().then(setWallpapers);
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings: SavedSettings = {
      frameStyle: state.frameStyle,
      background: state.background,
      padding: state.padding,
      shadowEnabled: state.shadowEnabled,
      shadowBlur: state.shadowBlur,
    };
    saveSettings(settings);
  }, [state.frameStyle, state.background, state.padding, state.shadowEnabled, state.shadowBlur]);

  const handleAddWallpaper = useCallback((dataUrl: string) => {
    setWallpapers((prev) => {
      const next = [dataUrl, ...prev].slice(0, MAX_WALLPAPERS);
      saveWallpapers(next);
      return next;
    });
  }, []);

  const capture = useCallback(async () => {
    dispatch({ type: "CAPTURE_START" });
    const res = await sendMessage({ type: "CAPTURE_TAB" });
    if (res.success && "dataUrl" in res) {
      dispatch({ type: "CAPTURE_SUCCESS", dataUrl: res.dataUrl });
    } else {
      dispatch({ type: "CAPTURE_FAIL" });
    }
  }, []);

  const captureAtSize = useCallback(
    async (width: number, height: number) => {
      dispatch({ type: "CAPTURE_START" });

      // Resize
      const resizeRes = await sendMessage({
        type: "RESIZE_WINDOW",
        width,
        height,
      });

      if (!resizeRes.success) {
        dispatch({ type: "CAPTURE_FAIL" });
        return;
      }

      const prevW =
        "previousWidth" in resizeRes ? resizeRes.previousWidth : 0;
      const prevH =
        "previousHeight" in resizeRes ? resizeRes.previousHeight : 0;

      // Wait for reflow
      await new Promise((r) => setTimeout(r, 400));

      // Capture
      const captureRes = await sendMessage({ type: "CAPTURE_TAB" });

      // Restore original size
      if (prevW && prevH) {
        await sendMessage({
          type: "RESTORE_WINDOW",
          width: prevW,
          height: prevH,
        });
      }

      if (captureRes.success && "dataUrl" in captureRes) {
        dispatch({ type: "CAPTURE_SUCCESS", dataUrl: captureRes.dataUrl });
      } else {
        dispatch({ type: "CAPTURE_FAIL" });
      }
    },
    []
  );

  return (
    <div className="app">
      <div className="app-header">
        <span className="app-title">Snappy</span>
        <ViewportMenu onSelect={captureAtSize} disabled={state.isCapturing} />
      </div>

      <button
        className="btn-capture"
        onClick={capture}
        disabled={state.isCapturing}
      >
        {state.isCapturing ? "Capturing…" : "Capture Screenshot"}
      </button>

      <PreviewCanvas
        ref={canvasRef}
        screenshotDataUrl={state.screenshotDataUrl}
        frameStyle={state.frameStyle}
        background={state.background}
        padding={state.padding}
        shadowEnabled={state.shadowEnabled}
        shadowBlur={state.shadowBlur}
      />

      <div className="controls">
        <FramePicker
          value={state.frameStyle}
          onChange={(v) => dispatch({ type: "SET_FRAME_STYLE", frameStyle: v })}
        />
        <BackgroundPicker
          value={state.background}
          wallpapers={wallpapers}
          onChange={(v) => dispatch({ type: "SET_BACKGROUND", background: v })}
          onAddWallpaper={handleAddWallpaper}
        />
        <PaddingSlider
          value={state.padding}
          onChange={(v) => dispatch({ type: "SET_PADDING", padding: v })}
        />
        <ShadowControl
          enabled={state.shadowEnabled}
          blur={state.shadowBlur}
          onToggle={(v) =>
            dispatch({ type: "SET_SHADOW_ENABLED", enabled: v })
          }
          onBlurChange={(v) =>
            dispatch({ type: "SET_SHADOW_BLUR", blur: v })
          }
        />
      </div>

      {state.screenshotDataUrl && <ActionButtons canvasRef={canvasRef} />}
    </div>
  );
}
