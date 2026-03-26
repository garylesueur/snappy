import React, { RefObject, useState } from "react";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export default function ActionButtons({ canvasRef }: Props) {
  const [copied, setCopied] = useState(false);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `snappy-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function handleCopy() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // clipboard write can fail in some contexts
      }
    }, "image/png");
  }

  return (
    <div className="action-buttons">
      <button className="btn-action btn-copy" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
      <button className="btn-action btn-download" onClick={handleDownload}>
        Download PNG
      </button>
    </div>
  );
}
