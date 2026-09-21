"use client";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import FormBuilder from "@/components/FormBuilder";
import { apiClient } from "@/lib/api";
import type { FormField, FormTemplate } from "@/types";

type ViewState = "loading" | "error" | "ready";

export default function FormulairePage() {
  const [forms, setForms] = useState<FormTemplate[]>([]); const [selected, setSelected] = useState<FormTemplate | null>(null); const [state, setState] = useState<ViewState>("loading"); const [newTitle, setNewTitle] = useState("");
  const load = () => { setState("loading"); apiClient.get<FormTemplate[]>("/form-templates/").then((res) => { setForms(res.data); setSelected((current) => res.data.find((item) => item.id === current?.id) || res.data.find((item) => item.is_default) || res.data[0] || null); setState("ready"); }).catch(() => setState("error")); };
  useEffect(load, []);
  const create = async (event: React.FormEvent) => { event.preventDefault(); if (!newTitle.trim()) return; const response = await apiClient.post<FormTemplate>("/form-templates/", { title: newTitle.trim(), fields_schema: [{ id: "nom", type: "text", label: "Nom", required: true }], is_default: forms.length === 0, is_active: true }); setNewTitle(""); setForms((items) => [...items, response.data]); setSelected(response.data); };
  const makeDefault = async (form: FormTemplate) => { const response = await apiClient.patch<FormTemplate>(`/form-templates/${form.id}/`, { is_default: true }); setForms((items) => items.map((item) => ({ ...item, is_default: item.id === form.id }))); setSelected(response.data); };
  const remove = async (form: FormTemplate) => { if (!window.confirm(`Supprimer « ${form.title} » ?`)) return; await apiClient.delete(`/form-templates/${form.id}/`); load(); };
  if (state === "loading") return <Loader fullScreen={false} />;
  if (state === "error") return <div className="space-y-3"><p className="text-ink-soft">Impossible de charger les formulaires.</p><button onClick={load} className="rounded-full bg-cta px-4 py-2 text-sm text-white">Réessayer</button></div>;
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-ink">Formulaires</h1><p className="text-sm text-ink-soft">Crée plusieurs parcours selon tes activités, puis relie chaque point d’accueil au bon formulaire.</p></div><form onSubmit={create} className="flex max-w-xl gap-2"><input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nom du nouveau formulaire" className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm" /><button className="rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-white">Créer</button></form><div className="grid gap-3 md:grid-cols-2">{forms.map((form) => <div key={form.id} className={`rounded-xl border p-4 ${selected?.id === form.id ? "border-ink bg-surface" : "border-border bg-canvas"}`}><button onClick={() => setSelected(form)} className="w-full text-left"><p className="font-semibold text-ink">{form.title}</p><p className="mt-1 text-xs text-ink-soft">{form.fields_schema.length} champs · v{form.version} {form.is_default ? "· formulaire par défaut" : ""}</p></button><div className="mt-3 flex gap-3 text-xs"><button onClick={() => makeDefault(form)} className="text-ink-soft hover:underline">Définir par défaut</button><button onClick={() => remove(form)} className="text-error-text hover:underline">Supprimer</button></div></div>)}</div>{selected && <FormBuilder key={selected.id} formId={selected.id} initialTitle={selected.title} initialSchema={selected.fields_schema as FormField[]} onSaved={load} />}</div>;
}
