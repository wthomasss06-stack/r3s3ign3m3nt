"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { Camera, Check, UploadSimple } from "@phosphor-icons/react";

import { apiClient } from "@/lib/api";

type Signature = { cloud_name: string; api_key: string; timestamp: number; folder: string; signature: string };

export default function CloudinaryImageUploader({ value, onChange, disabled = false, label = "Logo de l’entreprise" }: { value: string; onChange: (url: string) => void; disabled?: boolean; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setStatus("error"); setError("Choisis une image PNG, JPG, WEBP ou GIF."); return; }
    if (file.size > 5 * 1024 * 1024) { setStatus("error"); setError("Image trop lourde : 5 Mo maximum."); return; }
    setStatus("uploading"); setError("");
    try {
      const { data: signature } = await apiClient.post<Signature>("/org/uploads/cloudinary-signature/");
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signature.api_key);
      body.append("timestamp", String(signature.timestamp));
      body.append("folder", signature.folder);
      body.append("signature", signature.signature);
      const response = await axios.post<{ secure_url: string }>(`https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`, body, { timeout: 30_000 });
      onChange(response.data.secure_url);
      setStatus("success");
    } catch (uploadError) {
      setStatus("error");
      setError(axios.isAxiosError(uploadError) ? (uploadError.response?.data?.error?.message || "Upload Cloudinary impossible.") : "Upload Cloudinary impossible.");
    }
  };

  return <div className="space-y-2"><p className="text-sm font-medium text-ink">{label}</p><button type="button" disabled={disabled || status === "uploading"} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files?.[0]); }} className={`group relative grid h-32 w-48 place-items-center overflow-hidden rounded-2xl border border-dashed bg-canvas transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-60 ${dragging ? "border-cta bg-cta/10" : "border-border"}`}>{value ? <img src={value} alt="Aperçu du logo" className="h-full w-full object-contain p-2" /> : <span className="flex flex-col items-center gap-1 text-ink-soft"><Camera size={30} /><span className="text-xs">Dépose ton image ici</span></span>}{!disabled && <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/75 py-1.5 text-[11px] text-white opacity-0 transition group-hover:opacity-100"><UploadSimple size={13} /> Choisir un fichier</span>}<input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} /></button><p className="text-xs text-ink-soft">PNG, JPG, WEBP ou GIF · 5 Mo maximum</p>{status === "uploading" && <p className="text-xs text-ink-soft">Veuillez patienter…</p>}{status === "success" && <p className="flex items-center gap-1 text-xs text-success-text"><Check size={14} /> Image enregistrée</p>}{status === "error" && <p className="text-xs text-error-text">{error}</p>}</div>;
}
