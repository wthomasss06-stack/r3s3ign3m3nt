"use client";

import { useEffect, useState } from "react";

import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import type { AuditEvent, UserProfile } from "@/types";

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Connexion",
  "auth.logout": "Déconnexion",
  "invitation.revoked": "Invitation révoquée",
  "member.revoked": "Membre révoqué",
};

export default function AdministrationPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
