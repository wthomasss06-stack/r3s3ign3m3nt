"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Cube, PencilSimple, Plus, X } from "@phosphor-icons/react";

import Loader from "@/components/Loader";
import { useAuthContext } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { formatXOF } from "@/lib/karnet";
import type { KarnetResource, KarnetResourceUnit } from "@/types";

const UNIT_OPTIONS: { value: KarnetResourceUnit; label: string }[] = [
  { value: "jour", label: "Par jour" },
  { value: "heure", label: "Par heure" },
  { value: "unite", label: "Par unité" },
];

const emptyForm = { name: "", unit: "jour" as KarnetResourceUnit, price: "" };

export default function KarnetRessourcesPage() {
  const { user } = useAuthContext();
  const canManage = user?.role === "BOSS" || user?.role === "GERANT";
  const [resources, setResources] = useState<KarnetResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiClient
      .get<KarnetResource[]>("/karnet/resources/")
      .then((res) => setResources(res.data))
      .catch(() => setError("Impossible de charger les ressources."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (r: KarnetResource) => {
    setEditingId(r.id);
    setForm({ name: r.name, unit: r.unit, price: r.price });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || saving) return;
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await apiClient.patch(`/karnet/resources/${editingId}/`, form);
      } else {
        await apiClient.post("/karnet/resources/", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch {
      setError("Impossible d’enregistrer cette ressource.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: KarnetResource) => {
    await apiClient.patch(`/karnet/resources/${r.id}/`, { is_active: !r.is_active });
    load();
  };

  return (
    <div className="space-y-6">
      {canManage ? (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
          <div className="min-w-[160px] flex-1">
            <label className="text-xs font-medium text-ink-soft">Nom</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Chambre 12" className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink" />
          </div>
          <div className="min-w-[140px]">
            <label className="text-xs font-medium text-ink-soft">Facturation</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as KarnetResourceUnit })} className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink">
              {UNIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="text-xs font-medium text-ink-soft">Prix (F CFA)</label>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required type="number" min="1" placeholder="30000" className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink" />
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <Plus size={16} weight="bold" /> {editingId ? "Enregistrer" : "Ajouter"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg border border-border p-2 text-ink-soft hover:bg-canvas">
              <X size={16} />
            </button>
          )}
        </form>
      ) : (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-soft">Seuls le patron et le gérant peuvent ajouter ou modifier une ressource.</p>
      )}

      {error && <p className="text-sm text-error-text">{error}</p>}

      {loading ? (
        <Loader fullScreen={false} label="Chargement des ressources…" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <div key={r.id} className={`rounded-xl border border-border bg-surface p-4 ${!r.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Cube size={18} weight="bold" className="text-cta" />
                  <p className="font-semibold text-ink">{r.name}</p>
                </div>
                {canManage && (
                  <button onClick={() => startEdit(r)} className="text-ink-soft hover:text-ink">
                    <PencilSimple size={16} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-lg font-bold text-ink">{formatXOF(r.price)}</p>
              <p className="text-xs text-ink-soft">{r.unit_display}</p>
              {canManage && (
                <button onClick={() => toggleActive(r)} className="mt-3 text-xs font-medium text-ink-soft underline underline-offset-2">
                  {r.is_active ? "Désactiver" : "Réactiver"}
                </button>
              )}
            </div>
          ))}
          {resources.length === 0 && <p className="text-sm text-ink-soft">Aucune ressource déclarée pour l’instant.</p>}
        </div>
      )}
    </div>
  );
}
