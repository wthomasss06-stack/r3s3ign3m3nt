"use client";

import { CalendarCheck } from "@phosphor-icons/react";

import KarnetComingSoon from "@/components/dashboard/karnet/ComingSoon";
import { useAuthContext } from "@/context/AuthContext";

export default function KarnetReservationsPage() {
  const { organization } = useAuthContext();
  return (
    <KarnetComingSoon
      icon={CalendarCheck}
      title="Réservations"
      description="Planning et disponibilités de tes ressources, avec confirmation automatique."
      active={Boolean(organization?.capabilities?.reservations)}
    />
  );
}
