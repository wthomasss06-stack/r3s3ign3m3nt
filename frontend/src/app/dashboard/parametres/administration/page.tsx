"use client";

import { useEffect, useState } from "react";

import Loader from "@/components/Loader";
import { useDialog } from "@/components/ui/DialogProvider";
import { useAuthContext } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import type { AuditEvent, OrganizationCapabilities, UserProfile } from "@/types";

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Connexion",
  "auth.logout": "Déconnexion",
  "invitation.revoked": "Invitation révoquée",
  "member.revoked": "Membre révoqué",
  "organization.karnet_enabled": "KARN3T activé",
  "organization.karnet_disabled": "KARN3T désactivé",
  "organization.karnet_capability_updated": "Capacité KARN3T mise à jour",
};

const CAPABILITY_LABELS: { key: keyof OrganizationCapabilities; label: string }[] = [
  { key: "reservations", label: "Réservations" },
  { key: "payments", label: "Paiements" },
  { key: "rappels", label: "Rappels" },
];

export default function AdministrationPage() {
  const { organization, refreshUser } = useAuthContext();
  const { confirm } = useDialog();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const askToggleKarnet = async () => {
    const enabling = !organization?.karnet_enabled;
    await confirm({
      tone: "brand",
      title: enabling ? "Activer KARN3T ?" : "Désactiver KARN3T ?",
      message: enabling
        ? "Ton établissement passe au Niveau 2 : de nouvelles sections apparaissent dans la barre latérale."
        : "Les sections KARN3T disparaissent de la barre latérale. Rien n’est supprimé, tu pourras réactiver plus tard.",
      confirmLabel: enabling ? "Activer" : "Désactiver",
      cancelLabel: "Annuler",
      runningLabel: enabling ? "Activation…" : "Désactivation…",
      successTitle: enabling ? "KARN3T est activé !" : "KARN3T est désactivé.",
      successMessage: enabling
        ? "La barre latérale, le titre d’onglet et le favicon reflètent déjà le Niveau 2 — rien d’autre à faire."
        : "L’établissement repasse à l’identité Renseignement seule.",
      run: async () => {
        await apiClient.patch("/org/me/karnet/", { karnet_enabled: enabling });
        await refreshUser();
      },
    });
  };

  useEffect(() => {
    Promise.all([apiClient.get<UserProfile>("/auth/me/"), apiClient.get<AuditEvent[]>("/auth/audit/")])
      .then(([me, audit]) => {
        setUser(me.data);
        setEvents(audit.data);
      })
      .catch(() => setError("Impossible de charger le journal d’administration."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen={false} />;
  if (error || !user) return <p className="text-sm text-error-text">{error || "Accès refusé."}</p>;
  if (user.role !== "BOSS") return <p className="text-sm text-error-text">Cette section est réservée au patron.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Administration</h1>
        <p className="mt-1 text-sm text-ink-soft">Historique des connexions et des actions sensibles de ton établissement.</p>
      </div>
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink">Niveau 2 — KARN3T</h2>
            <p className="mt-1 max-w-md text-sm text-ink-soft">
              {organization?.karnet_enabled
                ? "KARN3T est actif : les sections Visiteurs, Ressources, Réservations, Paiements et Rappels apparaissent dans la barre latérale."
                : "Ajoute les fonctions de gestion hôtelière (visiteurs, ressources, réservations…) au-dessus de ton registre."}
            </p>
          </div>
          <button
            onClick={askToggleKarnet}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${
              organization?.karnet_enabled ? "border border-border text-ink-soft hover:bg-canvas" : "bg-cta text-white"
            }`}
          >
            {organization?.karnet_enabled ? "Désactiver KARN3T" : "Activer KARN3T"}
          </button>
        </div>
        {organization?.karnet_enabled && (
          <div className="mt-4 flex flex-wrap gap-2">
            {CAPABILITY_LABELS.map(({ key, label }) => {
              const active = Boolean(organization?.capabilities?.[key]);
              return (
                <span key={key} className={`rounded-full px-3 py-1 text-xs font-medium ${active ? "bg-cta/10 text-cta" : "bg-canvas text-ink-soft"}`}>
                  {label} · {active ? "actif" : "en préparation"}
                </span>
              );
            })}
          </div>
        )}
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold text-ink">Journal d’audit</h2>
        <div className="mt-4 divide-y divide-border">
          {events.map((event) => {
            const actor = event.actor_name?.trim() || event.actor_email || "Utilisateur inconnu";
            const target = event.target_name?.trim() || event.target_email || "";
            return (
              <div key={event.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{ACTION_LABELS[event.action] || event.action}</p>
                  <p className="text-ink-soft">Par <span className="font-medium text-ink">{actor}</span>{target ? ` · cible : ${target}` : ""}</p>
                </div>
                <time className="shrink-0 text-xs text-ink-soft" dateTime={event.created_at}>{new Date(event.created_at).toLocaleString("fr-FR")}</time>
              </div>
            );
          })}
          {events.length === 0 && <p className="py-3 text-sm text-ink-soft">Aucun événement d’administration.</p>}
        </div>
      </section>
    </div>
  );
}
