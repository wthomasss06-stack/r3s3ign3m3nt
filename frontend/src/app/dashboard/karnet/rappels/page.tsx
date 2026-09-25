"use client";

import { BellRinging } from "@phosphor-icons/react";

import KarnetComingSoon from "@/components/dashboard/karnet/ComingSoon";
import { useAuthContext } from "@/context/AuthContext";

export default function KarnetRappelsPage() {
  const { organization } = useAuthContext();
  return (
    <KarnetComingSoon
      icon={BellRinging}
      title="Rappels"
      description="Notifications automatiques à tes clients avant leur rendez-vous ou réservation."
      active={Boolean(organization?.capabilities?.rappels)}
    />
  );
}
