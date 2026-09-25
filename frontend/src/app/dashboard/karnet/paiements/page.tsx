"use client";

import { CreditCard } from "@phosphor-icons/react";

import KarnetComingSoon from "@/components/dashboard/karnet/ComingSoon";
import { useAuthContext } from "@/context/AuthContext";

export default function KarnetPaiementsPage() {
  const { organization } = useAuthContext();
  return (
    <KarnetComingSoon
      icon={CreditCard}
      title="Paiements"
      description="Encaissements liés aux réservations, suivis directement depuis ton établissement."
      active={Boolean(organization?.capabilities?.payments)}
    />
  );
}
