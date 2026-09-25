"use client";

import { UsersThree } from "@phosphor-icons/react";

import KarnetComingSoon from "@/components/dashboard/karnet/ComingSoon";
import { useAuthContext } from "@/context/AuthContext";

export default function KarnetVisiteursPage() {
  const { organization } = useAuthContext();
  return (
    <KarnetComingSoon
      icon={UsersThree}
      title="Visiteurs & clients"
      description="Un carnet de fiches clients relié à ton registre, avec historique des passages et coordonnées centralisées."
      active={Boolean(organization?.capabilities?.karnet)}
    />
  );
}
