"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardText, QrCode } from "@phosphor-icons/react";
import Loader from "@/components/Loader";
import QRCodeManager from "@/components/QRCodeManager";
import { apiClient } from "@/lib/api";
import type { Organization, UserProfile } from "@/types";

type ViewState = "loading" | "error" | "ready";

export default function AccueilPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [state, setState] = useState<ViewState>("loading");
  useEffect(() => {
    Promise.all([apiClient.get<Organization>("/org/me/"), apiClient.get<UserProfile>("/auth/me/")])
      .then(([orgRes, meRes]) => { setOrg(orgRes.data); setUser(meRes.data); setState("ready"); })
      .catch(() => setState("error"));
  }, []);
  if (state === "loading") return <Loader fullScreen={false} label="Ouverture de l’accueil…" />;
  if (state === "error" || !org || !user) return <div className="space-y-3"><p className="text-ink-soft">Impossible de charger l’accueil.</p><button onClick={() => location.reload()} className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white">Réessayer</button></div>;
  const isStaff = user.role === "STAFF";
  const visitorUrl = `/v/${org.qr_secure_token}`;
  return <div className="mx-auto max-w-5xl space-y-8">
    <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">{isStaff ? "Accueil" : "Mode staff"}</p><h1 className="mt-2 text-3xl font-bold text-ink">Accueil visiteurs</h1><p className="mt-2 max-w-2xl text-sm text-ink-soft">Affiche le QR pour les visiteurs équipés d’un téléphone ou ouvre directement le formulaire sur la tablette de l’établissement.</p></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
      <section className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-subtle sm:p-10"><div className="mb-5 flex items-center gap-2 text-sm font-medium text-ink"><QrCode size={20} weight="bold" /> QR de {org.name}</div><QRCodeManager qrToken={org.qr_secure_token} orgName={org.name} logoUrl={org.logo_url} canRegenerate={false} size={320} /><p className="mt-5 max-w-md text-sm text-ink-soft">Le logo de l’établissement est intégré au centre. Le visiteur peut scanner depuis plusieurs mètres.</p></section>
      <section className="space-y-4"><div className="rounded-2xl border border-border bg-surface p-5"><h2 className="font-heading text-lg font-semibold text-ink">Accueil sans téléphone</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">Prête la tablette ou l’ordinateur d’accueil au visiteur. Le formulaire se remet à zéro après chaque enregistrement.</p><Link href={visitorUrl} className="mt-5 flex items-center justify-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-medium text-white"><ClipboardText size={18} weight="bold" /> Ouvrir le formulaire</Link></div><div className="rounded-xl bg-canvas p-4 text-xs leading-relaxed text-ink-soft"><strong className="text-ink">Mode hors-ligne :</strong> une première ouverture avec Internet suffit pour mettre le formulaire en cache. Les fiches en attente seront synchronisées au retour du réseau.</div></section>
    </div>
  </div>;
}
