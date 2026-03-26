import React, { useEffect, forwardRef } from "react";
import type { FrameStyle, BackgroundOption } from "../../../lib/types";
import { composite } from "../../../lib/compositing";

interface Props {
  screenshotDataUrl: string | null;
  frameStyle: FrameStyle;
  background: BackgroundOption;
  padding: number;
  shadowEnabled: boolean;
  shadowBlur: number;
}

const PreviewCanvas = forwardRef<HTMLCanvasElement, Props>(
  function PreviewCanvas(
    { screenshotDataUrl, frameStyle, background, padding, shadowEnabled, shadowBlur },
    ref
  ) {
    useEffect(() => {
      if (!screenshotDataUrl || !ref || typeof ref === "function") return;
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const screenshot = new Image();
      screenshot.onload = () => {
        if (background.type === "image" && background.dataUrl) {
          const bgImg = new Image();
          bgImg.onload = () => {
            composite(canvas, ctx, screenshot, { frameStyle, background, padding, shadowEnabled, shadowBlur }, bgImg);
          };
          bgImg.src = background.dataUrl;
        } else {
          composite(canvas, ctx, screenshot, { frameStyle, background, padding, shadowEnabled, shadowBlur });
        }
      };
      screenshot.src = screenshotDataUrl;
    }, [screenshotDataUrl, frameStyle, background, padding, shadowEnabled, shadowBlur, ref]);

    if (!screenshotDataUrl) {
      return (
        <div className="preview-area">
          <div className="preview-placeholder">Capture a screenshot to preview</div>
        </div>
      );
    }

    return (
      <div className="preview-area">
        <canvas ref={ref} />
      </div>
    );
  }
);

export default PreviewCanvas;
