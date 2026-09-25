"use client";

import { useEffect } from "react";

import type { OrganizationCapabilities } from "@/types";

const IDENTITIES = {
  base: { title: "R3NS3IGN3M3NT", icon: "/favicon.png", apple: "/icons/icon-192.png" },
  karnet: { title: "KARN3T", icon: "/brand/karnet-favicon.png", apple: "/icons/karnet-apple-touch-icon.png" },
};

function setLinkIcon(rel: string, href: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Bascule l'identité du navigateur (titre d'onglet + favicon) entre Renseignement et
 * KARN3T selon `organization.capabilities.karnet` — un état décidé côté serveur
 * uniquement (cf. plan de bascule Niveau 1 → Niveau 2), jamais calculé ici.
 *
 * Le nom et le logo de CHAQUE établissement (orgName/orgLogo affichés dans la Sidebar)
 * restent inchangés : c'est l'identité de l'entreprise du client, pas celle du produit.
 * Seule l'identité produit du navigateur (ce composant) reflète le palier actif.
 *
 * Limite connue : le manifest PWA (public/manifest.json) reste statique et affiche
 * toujours l'identité Renseignement à l'installation — le rendre dynamique par
 * établissement demanderait un manifest généré côté serveur, hors périmètre ici.
 */
export default function ProductIdentity({ capabilities }: { capabilities?: OrganizationCapabilities }) {
  const isKarnet = Boolean(capabilities?.karnet);

  useEffect(() => {
    const identity = isKarnet ? IDENTITIES.karnet : IDENTITIES.base;
    document.title = identity.title;
    setLinkIcon("icon", identity.icon);
    setLinkIcon("apple-touch-icon", identity.apple);
  }, [isKarnet]);

  return null;
}
