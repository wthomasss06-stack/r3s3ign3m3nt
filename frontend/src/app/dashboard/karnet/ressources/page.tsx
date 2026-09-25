"use client";

import { Cube } from "@phosphor-icons/react";

import KarnetComingSoon from "@/components/dashboard/karnet/ComingSoon";
import { useAuthContext } from "@/context/AuthContext";

export default function KarnetRessourcesPage() {
  const { organization } = useAuthContext();
  return (
    <KarnetComingSoon
      icon={Cube}
      title="Ressources"
      description="Chambres, tables, salles ou équipements de ton établissement, à déclarer disponibles ou occupés."
      active={Boolean(organization?.capabilities?.karnet)}
    />
  );
}
