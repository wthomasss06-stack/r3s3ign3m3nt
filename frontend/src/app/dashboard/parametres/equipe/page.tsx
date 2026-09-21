"use client";
import { useEffect, useState } from "react";

import InviteStaff from "@/components/dashboard/InviteStaff";
import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import type { AuditEvent, TeamAccess, UserProfile } from "@/types";

type ViewState = "loading" | "error" | "ready";

export default function EquipePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [team, setTeam] = useState<TeamAccess | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [state, setState] = useState<ViewState>("loading");
  const [actionError, setActionError] = useState("");

  const load = () => {
    setState("loading");
    Promise.all([
      apiClient.get<UserProfile>("/auth/me/"),
      apiClient.get<TeamAccess>("/auth/team/"),
      apiClient.get<AuditEvent[]>("/auth/audit/"),
    ])
      .then(([me, access, audit]) => {
        setUser(me.data);
        setTeam(access.data);
        setEvents(audit.data);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  const revoke = async (path: string, label: string) => {
    if (!window.confirm(`${label} ? Cette action sera journalisée.`)) return;
    setActionError("");
    try {
      await apiClient.post(path, { reason: label });
      load();
    } catch {
      setActionError("Cette révocation n’a pas pu être effectuée.");
    }
  };

  if (state === "loading") return <Loader fullScreen={false} />;
  if (state === "error" || !user || !team) {
    return <div className="flex flex-col items-start gap-3"><p className="text-ink-soft">Impossible de charger cette page.</p><button onClick={load} className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-cta-ink">Réessayer</button></div>;
  }

  const isBoss = user.role === "BOSS";
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-ink">Équipe</h1><p className="text-sm text-ink-soft">Invite, consulte et révoque les accès de l’établissement. Les permissions sont expliquées par le bouton info à côté de chaque rôle.</p></div>
      <InviteStaff viewerRole={isBoss ? "BOSS" : "GERANT"} />
      {actionError && <p className="text-sm text-error-text">{actionError}</p>}

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold text-ink">Membres</h2>
        <div className="mt-4 divide-y divide-border">
          {team.members.map((member) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium text-ink">{member.full_name || member.email}</p><p className="text-xs text-ink-soft">{member.email} · {member.role === "GERANT" ? "Gérant" : member.role === "STAFF" ? "Staff" : "Patron"}{!member.is_active ? " · accès révoqué" : ""}</p></div>{isBoss && member.role !== "BOSS" && member.is_active && <button onClick={() => revoke(`/auth/team/members/${member.id}/revoke/`, `Révoquer ${member.email}`)} className="rounded-full border border-error-text px-3 py-1.5 text-xs text-error-text">Révoquer</button>}</div>)}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold text-ink">Invitations</h2>
        <div className="mt-4 divide-y divide-border">
          {team.invitations.length === 0 && <p className="py-3 text-sm text-ink-soft">Aucune invitation.</p>}
          {team.invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium text-ink">{invitation.email}</p><p className="text-xs text-ink-soft">{invitation.role === "GERANT" ? "Gérant" : "Staff"} · {invitation.accepted_at ? "acceptée" : invitation.revoked_at ? "révoquée" : "en attente"}</p></div>{isBoss && !invitation.accepted_at && !invitation.revoked_at && <button onClick={() => revoke(`/auth/team/invitations/${invitation.id}/revoke/`, `Révoquer l’invitation ${invitation.email}`)} className="rounded-full border border-error-text px-3 py-1.5 text-xs text-error-text">Révoquer</button>}</div>)}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5"><h2 className="font-semibold text-ink">Journal d’audit récent</h2><div className="mt-4 divide-y divide-border">{events.slice(0, 10).map((event) => <div key={event.id} className="py-2 text-sm text-ink"><span className="font-medium">{event.action}</span><span className="ml-2 text-ink-soft">{event.target_email || "—"} · {new Date(event.created_at).toLocaleString("fr-FR")}</span></div>)}{events.length === 0 && <p className="py-3 text-sm text-ink-soft">Aucun événement d’accès.</p>}</div></section>
    </div>
  );
}
