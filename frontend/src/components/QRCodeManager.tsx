"use client";
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowsClockwise, DownloadSimple } from "@phosphor-icons/react";
import { apiClient } from "@/lib/api";

export default function QRCodeManager({ qrToken, orgName, logoUrl = "", canRegenerate = true, size = 220 }: { qrToken: string; orgName: string; logoUrl?: string; canRegenerate?: boolean; size?: number }) {
  const [token, setToken] = useState(qrToken);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/v/${token}`;

  const download = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = `qr-${orgName.replace(/\s+/g, "_")}.png`; link.click();
  };
  const regenerate = async () => {
    if (!window.confirm("L’ancien QR cessera immédiatement de fonctionner. Continuer ?")) return;
    setRegenerating(true); setError(null);
    try { const { data } = await apiClient.post("/org/me/regenerate-qr/"); setToken(data.qr_secure_token); }
    catch { setError("Impossible de régénérer le QR. Réessaie."); }
    finally { setRegenerating(false); }
  };
  return <div className="flex max-w-sm flex-col items-center gap-5 rounded-xl border border-border bg-surface p-6">
    <div ref={containerRef} className="rounded-xl border border-border bg-white p-4"><QRCodeCanvas value={publicUrl} size={size} level="H" includeMargin imageSettings={logoUrl ? { src: logoUrl, height: Math.round(size * 0.2), width: Math.round(size * 0.2), excavate: true } : undefined} /></div>
    <p className="text-center text-sm text-ink-soft">Logo centré et protégé par correction d’erreur élevée. Affiche ce QR à l’accueil ou sur la tablette.</p>
    <div className="flex flex-wrap justify-center gap-3"><button onClick={download} className="flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white"><DownloadSimple size={16} weight="bold" /> Télécharger</button>{canRegenerate && <button onClick={regenerate} disabled={regenerating} className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-50"><ArrowsClockwise size={16} weight="bold" /> {regenerating ? "…" : "Régénérer"}</button>}</div>
    {error && <p className="text-sm text-error-text">{error}</p>}
  </div>;
}
