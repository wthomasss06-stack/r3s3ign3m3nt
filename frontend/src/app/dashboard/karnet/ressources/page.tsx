"use client";

import { useRouter, useSearchParams } from "next/navigation";

import ResourceBuilder from "@/components/karnet/ResourceBuilder";

export default function KarnetRessourcesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Arrivée depuis l'activation de KARN3T (voir paramètres/administration) :
  // le builder propose alors "Terminé" / "Plus tard" pour renvoyer vers la vue
  // d'ensemble une fois la configuration faite (ou sautée).
  const onboarding = searchParams.get("onboarding") === "1";

  return <ResourceBuilder onDone={onboarding ? () => router.push("/dashboard/karnet") : undefined} />;
}
