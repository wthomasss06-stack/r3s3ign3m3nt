"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Check, CaretDown, Plus, Trash, Bed, Scissors,
  Briefcase, Calendar, Car, Barbell, Cube, Users,
  Clock, Money, Hash, MapPin,
} from "@phosphor-icons/react";

import { apiClient } from "@/lib/api";
import { normalizeApiError } from "@/lib/errors";
import type { KarnetResource, KarnetResourceBillingUnit, KarnetResourceCategory } from "@/types";

type Props = { onDone?: () => void };

const CATEGORIES: { id: KarnetResourceCategory; label: string; description: string; icon: typeof Bed; types: string[] }[] = [
  { id: "accommodation", label: "Hébergement", description: "Hôtels, auberges, résidences et locations.", icon: Bed, types: ["Chambre simple", "Chambre double", "Chambre familiale", "Suite", "Studio", "Appartement", "Villa"] },
  { id: "beauty", label: "Beauté et soins", description: "Salons, instituts et spas.", icon: Scissors, types: ["Fauteuil de coiffure", "Poste de manucure", "Cabine de soin", "Salle de massage", "Fauteuil de pédicure", "Poste de maquillage"] },
  { id: "workspace", label: "Espaces professionnels", description: "Bureaux, coworking et salles.", icon: Briefcase, types: ["Bureau individuel", "Bureau partagé", "Salle de réunion", "Salle de formation", "Salle de conférence", "Espace de travail"] },
  { id: "events", label: "Événementiel et restauration", description: "Salles, tables et espaces à privatiser.", icon: Calendar, types: ["Table de restaurant", "Salle privative", "Salle de réception", "Salle de fête", "Espace événementiel", "Terrasse privatisable"] },
  { id: "parking", label: "Stationnement", description: "Places, garages et emplacements.", icon: Car, types: ["Place de parking", "Box fermé", "Emplacement moto", "Place couverte"] },
  { id: "leisure", label: "Sport et loisirs", description: "Installations sportives et loisirs.", icon: Barbell, types: ["Terrain de football", "Terrain de tennis", "Salle de sport", "Piscine privatisable", "Terrain multisport", "Espace de loisirs"] },
  { id: "other", label: "Autre ressource", description: "Créer une ressource personnalisée.", icon: Cube, types: [] },
];
const BILLING: { value: KarnetResourceBillingUnit; label: string }[] = [
  { value: "hour", label: "Par heure" }, { value: "session", label: "Par séance" },
  { value: "day", label: "Par jour" }, { value: "night", label: "Par nuit" },
  { value: "month", label: "Par mois" }, { value: "fixed", label: "Forfait fixe" },
];
const inputClass = "w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-cta focus:ring-2 focus:ring-cta/10";

type Draft = {
  id: string | null; // null = nouvelle ressource pas encore enregistrée
  name: string; code: string; category: KarnetResourceCategory; resource_type: string;
  description: string; capacity: string; price: string; billing_unit: KarnetResourceBillingUnit;
  location: string; equipment: string; duration_label: string; is_active: boolean;
};

function blankDraft(category: KarnetResourceCategory = "accommodation"): Draft {
  return {
    id: null, name: "", code: "", category,
    resource_type: CATEGORIES.find((c) => c.id === category)?.types[0] ?? "",
    description: "", capacity: "", price: "",
    billing_unit: category === "accommodation" ? "night" : "hour",
    location: "", equipment: "", duration_label: "", is_active: true,
  };
}

function toDraft(r: KarnetResource): Draft {
  return {
    id: r.id, name: r.name, code: r.code, category: r.category, resource_type: r.resource_type,
    description: r.description, capacity: r.capacity != null ? String(r.capacity) : "", price: r.price,
    billing_unit: (r.billing_unit || "fixed") as KarnetResourceBillingUnit,
    location: r.location, equipment: r.equipment, duration_label: r.duration_label, is_active: r.is_active,
  };
}

/**
 * Créateur/éditeur de ressources KARN3T, par catégorie et type (chambre, fauteuil,
 * bureau…) plutôt qu'un simple champ "unité" — voir le parcours d'onboarding
 * décrit avec l'équipe. Chaque ressource est enregistrée immédiatement (comme le
 * reste de l'app : réservations, paiements) plutôt que dans un brouillon local
 * qu'un "Enregistrer" final pousserait d'un coup — plus sûr si on ferme l'onglet
 * en cours de route, et cohérent avec le reste du produit.
 */
export default function ResourceBuilder({ onDone }: Props) {
  const [resources, setResources] = useState<KarnetResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  const load = () => {
    setLoading(true);
    apiClient
      .get<KarnetResource[]>("/karnet/resources/")
      .then((res) => setResources(res.data))
      .catch(() => setListError("Impossible de charger les ressources."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const category = useMemo(() => CATEGORIES.find((c) => c.id === draft?.category), [draft?.category]);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setError("");
  };

  const submitDraft = async () => {
    if (!draft) return;
    if (!draft.name.trim()) return setError("Donne un nom à cette ressource.");
    if (!draft.price || Number(draft.price) <= 0) return setError("Indique un prix supérieur à 0.");
    if (draft.capacity && Number(draft.capacity) <= 0) return setError("La capacité doit être supérieure à 0.");

    setSaving(true);
    setError("");
    const payload = {
      name: draft.name.trim(), code: draft.code.trim(), category: draft.category,
      resource_type: draft.resource_type.trim(), description: draft.description.trim(),
      capacity: draft.capacity ? Number(draft.capacity) : null, price: draft.price,
      billing_unit: draft.billing_unit, location: draft.location.trim(),
      equipment: draft.equipment.trim(), duration_label: draft.duration_label.trim(),
      is_active: draft.is_active,
    };
    try {
      const response = draft.id
        ? await apiClient.patch<KarnetResource>(`/karnet/resources/${draft.id}/`, payload)
        : await apiClient.post<KarnetResource>("/karnet/resources/", payload);
      setResources((current) => {
        const exists = current.some((r) => r.id === response.data.id);
        return exists ? current.map((r) => (r.id === response.data.id ? response.data : r)) : [...current, response.data];
      });
      setDraft(null);
    } catch (err) {
      setError(normalizeApiError(err).message || "Impossible d’enregistrer cette ressource.");
    } finally {
      setSaving(false);
    }
  };

  const removeResource = async (resource: KarnetResource) => {
    setDeletingId(resource.id);
    try {
      const response = await apiClient.delete<KarnetResource | undefined>(`/karnet/resources/${resource.id}/`);
      if (response.status === 200 && response.data) {
        // Historique protégé : le backend a désactivé plutôt que supprimé.
        setResources((current) => current.map((r) => (r.id === resource.id ? response.data! : r)));
      } else {
        setResources((current) => current.filter((r) => r.id !== resource.id));
      }
    } catch {
      setListError("Impossible de supprimer cette ressource.");
    } finally {
      setDeletingId(null);
    }
  };

  if (draft) return (
    <div className="mx-auto w-full max-w-5xl space-y-6 text-ink">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setDraft(null)} aria-label="Retour" className="rounded-full border border-border p-2 hover:bg-canvas"><ArrowLeft size={18} /></button>
        <div><p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Configuration KARN3T</p><h2 className="text-xl font-semibold">{category?.label ?? "Choisir une catégorie"}</h2></div>
      </div>
      {!category ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => { const Icon = cat.icon; return <button key={cat.id} type="button" onClick={() => setDraft(blankDraft(cat.id))} className="rounded-xl border border-border bg-surface p-4 text-left transition hover:border-cta hover:bg-cta/5"><Icon size={26} className="mb-3 text-cta" /><p className="font-semibold">{cat.label}</p><p className="mt-1 text-sm text-ink-soft">{cat.description}</p></button>; })}
      </div> : <div className="space-y-5 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de la ressource *"><input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex. Chambre 204" className={inputClass} /></Field>
          <Field label="Identifiant / référence" icon={<Hash size={16} />}><input value={draft.code} onChange={(e) => update("code", e.target.value)} placeholder="Ex. CH-204" className={inputClass} /></Field>
          <Field label="Type de ressource">
            {category.types.length > 0 ? (
              <div className="relative">
                <select value={draft.resource_type} onChange={(e) => update("resource_type", e.target.value)} className={`${inputClass} appearance-none pr-9`}>
                  {category.types.map((type) => <option key={type}>{type}</option>)}
                </select>
                <CaretDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              </div>
            ) : (
              <input value={draft.resource_type} onChange={(e) => update("resource_type", e.target.value)} placeholder="Ex. Casier, matériel…" className={inputClass} />
            )}
          </Field>
          <Field label="Capacité maximale" icon={<Users size={16} />}><input type="number" min="1" value={draft.capacity} onChange={(e) => update("capacity", e.target.value)} placeholder="Ex. 2 personnes" className={inputClass} /></Field>
          <Field label="Prix (FCFA) *" icon={<Money size={16} />}><input type="number" min="0" value={draft.price} onChange={(e) => update("price", e.target.value)} placeholder="Ex. 25000" className={inputClass} /></Field>
          <Field label="Mode de tarification"><div className="relative"><select value={draft.billing_unit} onChange={(e) => update("billing_unit", e.target.value as KarnetResourceBillingUnit)} className={`${inputClass} appearance-none pr-9`}>{BILLING.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}</select><CaretDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" /></div></Field>
          <Field label="Emplacement" icon={<MapPin size={16} />}><input value={draft.location} onChange={(e) => update("location", e.target.value)} placeholder="Ex. 2e étage, aile B" className={inputClass} /></Field>
          <Field label="Durée habituelle" icon={<Clock size={16} />}><input value={draft.duration_label} onChange={(e) => update("duration_label", e.target.value)} placeholder="Ex. 60 minutes, 1 nuit" className={inputClass} /></Field>
        </div>
        <Field label="Description"><textarea value={draft.description} onChange={(e) => update("description", e.target.value)} rows={3} placeholder="Décris brièvement cette ressource…" className={`${inputClass} resize-y`} /></Field>
        <Field label="Équipements et caractéristiques"><input value={draft.equipment} onChange={(e) => update("equipment", e.target.value)} placeholder="Ex. Climatisation, Wi-Fi, télévision" className={inputClass} /></Field>
        <label className="flex items-center gap-3 rounded-xl border border-border bg-canvas/60 p-4"><input type="checkbox" checked={draft.is_active} onChange={(e) => update("is_active", e.target.checked)} className="h-4 w-4 accent-cta" /><span><span className="block text-sm font-medium">Ressource active</span><span className="block text-xs text-ink-soft">Une ressource inactive ne sera pas proposée pour une nouvelle réservation.</span></span></label>
        {error && <p role="alert" className="text-sm text-error-text">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={submitDraft} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-semibold text-white hover:bg-cta-hover disabled:opacity-60"><Check size={17} /> {saving ? "Enregistrement…" : draft.id ? "Enregistrer les modifications" : "Ajouter la ressource"}</button>
          <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-canvas">Annuler</button>
        </div>
      </div>}
    </div>
  );

  return <div className="mx-auto w-full max-w-5xl space-y-6 text-ink">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Configuration KARN3T</p><h1 className="mt-1 text-2xl font-bold">Mes ressources</h1><p className="mt-2 max-w-2xl text-sm text-ink-soft">Crée les espaces ou équipements que tes clients pourront réserver. Chaque ressource est enregistrée dès que tu la valides.</p></div>
      <button type="button" onClick={() => setDraft(blankDraft())} className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-semibold text-white hover:bg-cta-hover"><Plus size={18} /> Ajouter une ressource</button>
    </header>
    {listError && <p role="alert" className="text-sm text-error-text">{listError}</p>}
    {loading ? <p className="text-sm text-ink-soft">Chargement…</p> : resources.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
        <Cube size={38} className="mx-auto text-ink-soft" />
        <h2 className="mt-4 text-lg font-semibold">Aucune ressource pour le moment</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">Choisis une catégorie, puis crée ta première ressource pour commencer à configurer les réservations.</p>
        <button type="button" onClick={() => setDraft(blankDraft())} className="mt-5 inline-flex items-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-semibold text-white hover:bg-cta-hover"><Plus size={17} /> Créer ma première ressource</button>
        {onDone && <button type="button" onClick={onDone} className="mt-3 block w-full text-sm font-medium text-ink-soft hover:text-ink">Plus tard</button>}
      </div>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        {resources.map((resource) => {
          const cat = CATEGORIES.find((c) => c.id === resource.category);
          const Icon = cat?.icon ?? Cube;
          return (
            <article key={resource.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-cta/10 p-3 text-cta"><Icon size={23} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{resource.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${resource.is_active ? "bg-emerald-500/10 text-emerald-700" : "bg-canvas text-ink-soft"}`}>{resource.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{resource.resource_type || cat?.label}{resource.code ? ` · ${resource.code}` : ""}</p>
                  <p className="mt-2 text-sm font-medium">{Number(resource.price).toLocaleString("fr-FR")} FCFA · {resource.billing_unit_display.toLowerCase() || resource.unit_display.toLowerCase()}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <button type="button" onClick={() => setDraft(toDraft(resource))} className="text-sm font-medium text-cta hover:underline">Modifier</button>
                <button type="button" onClick={() => removeResource(resource)} disabled={deletingId === resource.id} aria-label={`Supprimer ${resource.name}`} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-error-text disabled:opacity-60">
                  <Trash size={16} /> {deletingId === resource.id ? "…" : "Supprimer"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    )}
    {onDone && resources.length > 0 && (
      <footer className="flex justify-end border-t border-border pt-5">
        <button type="button" onClick={onDone} className="rounded-full bg-cta px-6 py-3 text-sm font-semibold text-white hover:bg-cta-hover">Terminé</button>
      </footer>
    )}
  </div>;
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-ink-soft">{icon}{label}</span>{children}</label>;
}
