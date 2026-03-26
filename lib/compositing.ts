import type { CompositingOptions, FrameStyle, BackgroundOption } from "./types";

interface FrameMetrics {
  top: number;
  right: number;
  bottom: number;
  left: number;
  radius: number;
}

//
function getFrameMetrics(style: FrameStyle): FrameMetrics {
  switch (style) {
    case "macos":
      return { top: 36, right: 0, bottom: 0, left: 0, radius: 12 };
    case "browser":
      return { top: 52, right: 0, bottom: 0, left: 0, radius: 12 };
    case "minimal":
      return { top: 0, right: 0, bottom: 0, left: 0, radius: 10 };
    case "none":
      return { top: 0, right: 0, bottom: 0, left: 0, radius: 8 };
  }
}

export function composite(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  screenshot: HTMLImageElement,
  options: CompositingOptions,
  bgImage?: HTMLImageElement
): void {
  const { frameStyle, background, padding, shadowEnabled, shadowBlur } =
    options;
  const metrics = getFrameMetrics(frameStyle);

  const imgW = screenshot.naturalWidth;
  const imgH = screenshot.naturalHeight;

  const frameW = imgW + metrics.left + metrics.right;
  const frameH = imgH + metrics.top + metrics.bottom;

  // Extra space for shadow to not clip
  const shadowExtra = shadowEnabled ? shadowBlur * 2 + 8 : 0;

  canvas.width = frameW + padding * 2 + shadowExtra;
  canvas.height = frameH + padding * 2 + shadowExtra;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Background
  drawBackground(ctx, canvas.width, canvas.height, background, screenshot, bgImage);

  // Offset everything so shadow doesn't clip
  const offsetX = padding + shadowExtra / 2;
  const offsetY = padding + shadowExtra / 2;

  // 2. Shadow
  if (shadowEnabled) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadowBlur / 4;
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    roundedRect(ctx, offsetX, offsetY, frameW, frameH, metrics.radius);
    ctx.fill();
    ctx.restore();
  }

  // 3. Frame + screenshot
  ctx.save();
  roundedRect(ctx, offsetX, offsetY, frameW, frameH, metrics.radius);
  ctx.clip();

  // Frame background
  if (frameStyle === "macos" || frameStyle === "browser") {
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(offsetX, offsetY, frameW, frameH);
  } else if (frameStyle === "minimal") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(offsetX, offsetY, frameW, frameH);
  }

  // Screenshot
  ctx.drawImage(
    screenshot,
    offsetX + metrics.left,
    offsetY + metrics.top,
    imgW,
    imgH
  );

  ctx.restore();

  // 4. Frame decorations (drawn on top, outside clip)
  if (frameStyle === "macos") {
    drawMacOSTitleBar(ctx, offsetX, offsetY, frameW, metrics);
  } else if (frameStyle === "browser") {
    drawBrowserTitleBar(ctx, offsetX, offsetY, frameW, metrics);
  } else if (frameStyle === "minimal") {
    // Subtle border
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1;
    roundedRect(ctx, offsetX, offsetY, frameW, frameH, metrics.radius);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: BackgroundOption,
  screenshot: HTMLImageElement,
  bgImage?: HTMLImageElement
): void {
  switch (bg.type) {
    case "gradient": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, bg.stops[0]);
      grad.addColorStop(1, bg.stops[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "solid":
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, w, h);
      break;
    case "transparent":
      ctx.clearRect(0, 0, w, h);
      break;
    case "image":
      if (bgImage) {
        drawCoverImage(ctx, bgImage, w, h);
      } else {
        ctx.fillStyle = "#1a1a1e";
        ctx.fillRect(0, 0, w, h);
      }
      break;
    case "blurred":
      drawBlurredBackground(ctx, w, h, bg.variant, screenshot);
      break;
  }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
): void {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
}

function drawBlurredBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  variant: "screenshot" | "light" | "dark",
  screenshot: HTMLImageElement
): void {
  if (variant === "screenshot") {
    // Render blurred screenshot into a slightly oversized temp canvas to
    // prevent the blur from clipping at the edges, then draw it centered.
    const bleed = 80;
    const tmp = document.createElement("canvas");
    tmp.width = w + bleed * 2;
    tmp.height = h + bleed * 2;
    const tc = tmp.getContext("2d")!;
    tc.filter = "blur(32px)";
    drawCoverImage(tc, screenshot, tmp.width, tmp.height);
    tc.filter = "none";
    // Dark overlay for contrast
    tc.fillStyle = "rgba(0, 0, 0, 0.35)";
    tc.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(tmp, -bleed, -bleed);
  } else if (variant === "light") {
    ctx.fillStyle = "#f0f0f5";
    ctx.fillRect(0, 0, w, h);
    // Subtle noise texture via overlapping semi-transparent rects
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(30,30,40,0.8)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawMacOSTitleBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frameW: number,
  metrics: FrameMetrics
): void {
  // Title bar bg (already drawn via frame fill, just add dots)
  const dotY = y + metrics.top / 2;
  const dotR = 6;
  const colors = ["#ff5f57", "#febc2e", "#28c840"];
  const startX = x + 18;

  colors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(startX + i * 20, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
}

function drawBrowserTitleBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frameW: number,
  metrics: FrameMetrics
): void {
  // Traffic lights
  const dotY = y + 18;
  const dotR = 6;
  const colors = ["#ff5f57", "#febc2e", "#28c840"];
  const startX = x + 18;

  colors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(startX + i * 20, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // URL bar
  const barX = x + 80;
  const barY = y + 8;
  const barW = frameW - 120;
  const barH = 28;

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  roundedRect(ctx, barX, barY, barW, barH, 6);
  ctx.fill();

  // URL bar placeholder dot
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.beginPath();
  ctx.arc(barX + 14, barY + barH / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Separator line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 44);
  ctx.lineTo(x + frameW, y + 44);
  ctx.stroke();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
