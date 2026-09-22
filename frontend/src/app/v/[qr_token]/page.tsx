"use client";
import { useParams } from "next/navigation";

import Loader from "@/components/Loader";
import VisitorForm from "@/components/VisitorForm";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { usePublicForm } from "@/hooks/usePublicForm";

export default function VisitorPage() {
  const params = useParams<{ qr_token: string }>();
  const qrToken = params.qr_token;
  const { data, status } = usePublicForm(qrToken);

  // Vide la file des soumissions en attente des qu'une connexion revient sur CET
  // appareil (kiosque) — independant du statut de chargement du formulaire lui-meme.
  const sync = useBackgroundSync();

  if (status === "loading") {
    return <Loader />;
  }
  if (status === "not_found") {
    return <CenteredMessage title="QR Code invalide" message="Ce lien n'est plus actif. Contacte l'accueil." />;
  }
  if (status === "never_cached") {
    return (
      <CenteredMessage
        title="Pas encore configuré"
        message="Connecte cet appareil à internet une première fois pour activer le formulaire."
      />
    );
  }
  if (!data) return null;

  return (
    <VisitorForm
      schema={data.fields_schema}
      qrToken={qrToken}
      orgName={data.organization_name}
      logoUrl={data.organization_logo_url}
      visitReasons={data.visit_reasons}
      syncState={sync}
    />
  );
}

function CenteredMessage({ title, message }: { title: string; message?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      {message && <p className="text-ink-soft">{message}</p>}
    </main>
  );
}
