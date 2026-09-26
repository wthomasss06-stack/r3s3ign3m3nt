"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MagnifyingGlass, Plus, UsersThree } from "@phosphor-icons/react";

import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import type { KarnetClient } from "@/types";

export default function KarnetVisiteursPage() {
  const [clients, setClients] = useState<KarnetClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const load = (query?: string) => {
    setLoading(true);
    apiClient
      .get<KarnetClient[]>("/karnet/clients/", { params: query ? { search: query } : {} })
      .then((res) => setClients(res.data))
      .catch(() => setError("Impossible de charger les clients."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      await apiClient.post("/karnet/clients/", form);
      setForm({ full_name: "", phone: "", email: "" });
      load(search);
    } catch {
      setError("Impossible d’ajouter ce client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="min-w-[160px] flex-1">
          <label className="text-xs font-medium text-ink-soft">Nom complet</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            placeholder="David Kouassi"
            className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink"
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="text-xs font-medium text-ink-soft">Téléphone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="07 07 07 07 07"
            className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink"
          />
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Plus size={16} weight="bold" /> {saving ? "Ajout…" : "Ajouter"}
        </button>
      </form>

      {error && <p className="text-sm text-error-text">{error}</p>}

      <div className="rounded-xl border border-border bg-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(search);
          }}
          className="flex items-center gap-2 border-b border-border p-4"
        >
          <MagnifyingGlass size={16} className="text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client…"
            className="w-full max-w-xs bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
          />
        </form>
        {loading ? (
          <Loader fullScreen={false} label="Chargement des clients…" />
        ) : (
          <div className="divide-y divide-border">
            {clients.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas">
                  <UsersThree size={16} weight="bold" className="text-ink-soft" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{c.full_name}</p>
                  <p className="truncate text-xs text-ink-soft">{[c.phone, c.email].filter(Boolean).join(" · ") || "Aucun contact renseigné"}</p>
                </div>
              </div>
            ))}
            {clients.length === 0 && <p className="p-4 text-sm text-ink-soft">Aucun client pour l’instant.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
