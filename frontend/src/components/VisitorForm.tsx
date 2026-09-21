"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowClockwise, CloudCheck, DeviceMobile } from "@phosphor-icons/react";
import { ArrowUpRight } from "@/components/icons";
import { useSubmitForm } from "@/hooks/useSubmitForm";
import type { FormField } from "@/types";
import SignaturePad from "./SignaturePad";

type ResponseValue = string | boolean;
export default function VisitorForm({ schema, qrToken, orgName, logoUrl = "", visitReasons = [] }: { schema: FormField[]; qrToken: string; orgName: string; logoUrl?: string; visitReasons?: string[] }) {
  const [formData, setFormData] = useState<Record<string, ResponseValue>>({});
  const [signature, setSignature] = useState("");
  const [reasons, setReasons] = useState(visitReasons);
  const { submitForm, status } = useSubmitForm(qrToken);
  const setValue = (id: string, value: ResponseValue) => setFormData((prev) => ({ ...prev, [id]: value }));
  useEffect(() => { setReasons(visitReasons); }, [visitReasons]);
  useEffect(() => { if (status === "synced" || status === "saved_offline") { const timer = window.setTimeout(() => { if (window.innerWidth < 640) window.close(); else { setFormData({}); setSignature(""); location.reload(); } }, 4500); return () => window.clearTimeout(timer); } }, [status]);
  if (status === "saved_offline") return <StatusScreen icon={<DeviceMobile size={40} className="text-ink-soft" />} title="Enregistré sur cet appareil" message={`Merci. Tes informations seront transmises à ${orgName} dès le retour du réseau.`} />;
  if (status === "synced") return <StatusScreen icon={<CloudCheck size={40} className="text-success-text" />} title="Merci, c’est enregistré" message={`Tu peux fermer cette page. Bienvenue chez ${orgName}.`} />;
  const handleSubmit = async (e: FormEvent) => { e.preventDefault(); await submitForm(formData, signature); };
  return <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6 p-6">
    <header className="mb-2 flex items-center gap-3">{logoUrl ? <img src={logoUrl} alt="" className="h-12 w-12 rounded-xl object-contain" /> : null}<div><h1 className="text-2xl font-bold text-ink">{orgName}</h1><p className="text-sm text-ink-soft">Merci de remplir ce registre d&apos;accès</p></div></header>
    {schema.map((field) => { const requiredMark = field.required && <span className="text-error-text">*</span>; if (field.type === "checkbox") return <label key={field.id} className="flex items-start gap-2.5 text-sm text-ink"><input type="checkbox" required={field.required} className="mt-0.5 h-4 w-4 accent-cta" onChange={(e) => setValue(field.id, e.target.checked)} /><span>{field.label} {requiredMark}</span></label>;
      return <div key={field.id} className="flex flex-col gap-1.5"><label className="text-sm font-medium text-ink">{field.label} {requiredMark}</label>{field.type === "select" ? <><select required={field.required} className="rounded-lg border border-border bg-surface p-3 text-ink outline-none focus:border-ink" onChange={(e) => setValue(field.id, e.target.value)}><option value="">Sélectionne une option</option>{(field.options?.length ? field.options : reasons).map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select>{(field.options || reasons).includes("Autre") && formData[field.id] === "Autre" && <input required type="text" placeholder="Précise le motif" className="rounded-lg border border-border bg-surface p-3 text-ink outline-none focus:border-ink" onChange={(e) => setValue(`${field.id}_autre`, e.target.value)} />}</> : field.type === "signature" ? <SignaturePad onSave={setSignature} /> : <input type={field.type === "phone" ? "tel" : field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} inputMode={field.type === "number" ? "numeric" : undefined} required={field.required} className="rounded-lg border border-border bg-surface p-3 text-ink outline-none focus:border-ink" onChange={(e) => setValue(field.id, e.target.value)} />}</div>; })}
    {reasons.length > 0 && <button type="button" onClick={() => setReasons([...reasons])} className="flex items-center gap-1 text-xs text-ink-soft underline"><ArrowClockwise size={14} /> Actualiser les motifs</button>}
    <button type="submit" disabled={status === "saving"} className="flex w-full items-center justify-center gap-2 rounded-full bg-cta py-3.5 font-medium text-white disabled:opacity-50">{status === "saving" ? "Enregistrement…" : <>Valider mon entrée <ArrowUpRight size={16} /></>}</button>
  </form>;
}
function StatusScreen({ icon, title, message }: { icon: ReactNode; title: string; message: string }) { return <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">{icon}<h2 className="text-2xl font-bold text-ink">{title}</h2><p className="max-w-sm text-ink-soft">{message}</p></div>; }
