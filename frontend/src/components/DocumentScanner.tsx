"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, IdentificationCard, Spinner, X } from "@phosphor-icons/react";
import { createWorker } from "tesseract.js";

type ExtractKey = "last_name" | "first_names" | "document_number" | "birth_date" | "nationality" | "expiry_date";
export type DocumentScanResult = { document_type: string; extracted: Partial<Record<ExtractKey, string>>; raw_text: string; image?: string; validated_at: string };

const LABELS: Record<ExtractKey, string> = { last_name: "Nom", first_names: "Prénoms", document_number: "Numéro du document", birth_date: "Date de naissance", nationality: "Nationalité", expiry_date: "Date d’expiration" };

function guessFields(text: string, keys: ExtractKey[]) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const dates = text.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g) || [];
  const number = text.match(/\b[A-Z]{1,4}[A-Z0-9-]{5,18}\b/g)?.[0] || "";
  const result: Partial<Record<ExtractKey, string>> = {};
  if (keys.includes("last_name")) result.last_name = lines.find((line) => /^[A-ZÀ-Ÿ\s'-]{3,}$/.test(line)) || lines[0] || "";
  if (keys.includes("first_names")) result.first_names = lines[1] || "";
  if (keys.includes("document_number")) result.document_number = number;
  if (keys.includes("birth_date")) result.birth_date = dates[0] || "";
  if (keys.includes("expiry_date")) result.expiry_date = dates[1] || "";
  if (keys.includes("nationality")) result.nationality = (lines.find((line) => /ivoir|national|fran|ghan|malien|sénégal/i.test(line)) || "");
  return result;
}

export default function DocumentScanner({ documentType = "free", extractFields = ["last_name", "first_names", "document_number", "birth_date"], required = false, requiresAgentValidation = true, retainDocumentImage = false, onChange }: { documentType?: string; extractFields?: ExtractKey[]; required?: boolean; requiresAgentValidation?: boolean; retainDocumentImage?: boolean; onChange: (value: DocumentScanResult | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [open, setOpen] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [values, setValues] = useState<Partial<Record<ExtractKey, string>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  const stopCamera = () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setOpen(true);
    } catch { setError("Impossible d’ouvrir la caméra arrière. Vérifie l’autorisation de la caméra."); }
  };

  const capture = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas"); canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.82); stopCamera(); setOpen(false); setCaptured(image); setBusy(true); setError("");
    try {
      const worker = await createWorker("fra");
      const result = await worker.recognize(image);
      await worker.terminate();
      setRawText(result.data.text); setValues(guessFields(result.data.text, extractFields));
    } catch { setError("La lecture OCR a échoué. Tu peux reprendre la photo ou saisir les informations manuellement."); }
    finally { setBusy(false); }
  };

  const validate = () => {
    const result: DocumentScanResult = { document_type: documentType, extracted: values, raw_text: rawText, validated_at: new Date().toISOString(), ...(retainDocumentImage && captured ? { image: captured } : {}) };
    setValidated(true); onChange(result);
  };
  const reset = () => { setCaptured(null); setRawText(""); setValues({}); setValidated(false); onChange(null); };

  return <div className="space-y-3 rounded-xl border border-border bg-canvas p-4">
    <div className="flex items-start gap-3"><IdentificationCard size={24} className="mt-0.5 text-ink-soft" /><div className="min-w-0 flex-1"><p className="font-medium text-ink">Scanner une pièce d’identité</p><p className="text-xs text-ink-soft">CNI, passeport ou document — caméra arrière et OCR.</p></div></div>
    {!captured && !open && <button type="button" onClick={startCamera} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cta px-4 py-3 text-sm font-semibold text-white"><Camera size={18} /> Ouvrir la caméra arrière</button>}
    {open && <div className="space-y-3"><video ref={videoRef} playsInline muted className="aspect-[4/3] w-full rounded-lg bg-black object-cover" /><div className="flex gap-2"><button type="button" onClick={capture} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cta px-4 py-3 text-sm font-semibold text-white"><Camera size={18} /> Capturer</button><button type="button" onClick={() => { stopCamera(); setOpen(false); }} className="rounded-lg border border-border px-4 py-3 text-sm text-ink"><X size={18} /></button></div></div>}
    {busy && <p className="flex items-center gap-2 text-sm text-ink-soft"><Spinner size={18} className="animate-spin" /> Lecture OCR en cours…</p>}
    {captured && !busy && !validated && <div className="space-y-3"><p className="text-xs text-ink-soft">Vérifie les informations extraites avant de valider. L’OCR peut faire des erreurs.</p>{extractFields.map((key) => <label key={key} className="block text-xs font-medium text-ink-soft">{LABELS[key]}<input value={values[key] || ""} onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))} required={required} className="mt-1 w-full rounded-lg border border-border bg-surface p-2.5 text-sm text-ink outline-none focus:border-ink" /></label>)}<div className="flex gap-2"><button type="button" onClick={validate} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success-text px-4 py-3 text-sm font-semibold text-white"><Check size={18} /> {requiresAgentValidation ? "Valider les informations" : "Confirmer"}</button><button type="button" onClick={reset} className="rounded-lg border border-border px-4 py-3 text-sm text-ink">Reprendre</button></div></div>}
    {validated && <div className="flex items-center justify-between rounded-lg border border-success-text/30 bg-success-bg p-3 text-sm text-success-text"><span className="flex items-center gap-2"><Check size={18} /> Identité vérifiée</span><button type="button" onClick={reset} className="text-xs underline">Modifier</button></div>}
    {error && <p className="text-xs text-error-text">{error}</p>}
    {required && !validated && <p className="text-xs text-ink-soft">Ce scan est obligatoire.</p>}
  </div>;
}

export { LABELS };
