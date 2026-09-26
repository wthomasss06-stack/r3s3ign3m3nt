"use client";

import Link from "next/link";
import { BellRinging, CalendarCheck, CreditCard, Cube, UsersThree } from "@phosphor-icons/react";
import type { ElementType } from "react";

import { useAuthContext } from "@/context/AuthContext";
import type { OrganizationCapabilities } from "@/types";

const SECTIONS: { key: keyof OrganizationCapabilities; href: string; label: string; icon: ElementType; description: string }[] = [
  { key: "karnet", href: "/dashboard", label: "Clients", icon: UsersThree, description: "Les visiteurs enregistrés deviennent des fiches clients réutilisables." },
  { key: "karnet", href: "/dashboard/karnet/ressources", label: "Ressources", icon: Cube, description: "Chambres, tables ou articles avec leur prix déclaré." },
  { key: "reservations", href: "/dashboard/karnet/reservations", label: "Réservations", icon: CalendarCheck, description: "Créneaux, montant calculé automatiquement à la création." },
  { key: "payments", href: "/dashboard/karnet/paiements", label: "Paiements", icon: CreditCard, description: "Suivi manuel des montants dus et encaissés — pas de vraie transaction pour l'instant." },
  { key: "rappels", href: "/dashboard/karnet/rappels", label: "Rappels", icon: BellRinging, description: "Sonnerie quand un créneau facturé à l'heure arrive à son terme." },
];

export default function KarnetOverviewPage() {
  const { organization } = useAuthContext();
  const capabilities = organization?.capabilities;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        L’accueil collecte les informations une seule fois : KARN3T les exploite ensuite pour gérer les ressources, réservations, paiements et rappels.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ key, href, label, icon: Icon, description }) => {
          const active = Boolean(capabilities?.[key]);
          return (
            <Link key={href} href={href} className="rounded-xl border border-border bg-surface p-4 transition hover:border-cta">
              <div className="flex items-center justify-between">
                <Icon size={22} weight="bold" className="text-cta" />
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${active ? "bg-cta/10 text-cta" : "bg-canvas text-ink-soft"}`}>
                  {active ? "Actif" : "Bientôt"}
                </span>
              </div>
              <p className="mt-3 font-semibold text-ink">{label}</p>
              <p className="mt-1 text-sm text-ink-soft">{description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
