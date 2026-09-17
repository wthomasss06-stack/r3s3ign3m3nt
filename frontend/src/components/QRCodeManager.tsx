"use client";
import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowsClockwise, DownloadSimple } from "@phosphor-icons/react";

import { apiClient } from "@/lib/api";

export default function QRCodeManager({
  qrToken,
  orgName,
  canRegenerate = true,
}: {
  qrToken: string;
  orgName: string;
  canRegenerate?: boolean;
}) {
  const [token, setToken] = useState(qrToken);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<SVGSVGElement>(null);

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/v/${token}`;

  const download = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${orgName.replace(/\s+/g, "_")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const regenerate = async () => {
    const confirmed = window.confirm(
      "L'ancien QR cessera immédiatement de fonctionner — il faudra réimprimer/réafficher le nouveau. Continuer ?"
    );
    if (!confirmed) return;
    setRegenerating(true);
    setError(null);
    try {
      const { data } = await apiClient.post("/org/me/regenerate-qr/");
      setToken(data.qr_secure_token);
    } catch {
      setError("Impossible de régénérer le QR. Réessaie.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="flex max-w-sm flex-col items-center gap-6 rounded-xl border border-border bg-surface p-6">
      <div className="rounded-lg border border-border bg-white p-4">
        <QRCodeSVG ref={qrRef} value={publicUrl} size={220} level="H" includeMargin />
      </div>
      <p className="text-center text-sm text-ink-soft">
        Affiche ce QR à l&apos;accueil, ou installe-le directement sur la tablette dédiée.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={download}
          className="flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover active:scale-[0.98]"
        >
          <DownloadSimple size={16} weight="bold" /> Télécharger
        </button>
        {canRegenerate && (
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink disabled:opacity-50"
          >
            <ArrowsClockwise size={16} weight="bold" /> {regenerating ? "..." : "Régénérer"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-error-text">{error}</p>}
    </div>
  );
}
