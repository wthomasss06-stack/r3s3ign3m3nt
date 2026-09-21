"use client";
import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { ArrowCounterClockwise } from "@phosphor-icons/react";

export default function SignaturePad({ onSave }: { onSave: (signatureBlob: string) => void }) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    sigCanvas.current?.clear();
    onSave("");
  };

  const handleEnd = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    if (dataUrl) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 180"><image href="${dataUrl}" width="500" height="180" preserveAspectRatio="none" /></svg>`;
      onSave(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg border border-border bg-canvas">
        <SignatureCanvas
          ref={sigCanvas}
          onEnd={handleEnd}
          penColor="#2F3437"
          canvasProps={{ className: "h-36 w-full cursor-crosshair" }}
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="flex items-center gap-1 self-end text-xs text-ink-soft transition hover:text-ink"
      >
        <ArrowCounterClockwise size={14} weight="bold" /> Effacer et recommencer
      </button>
    </div>
  );
}
