import type { Metadata } from "next";

import LegalLayout from "@/components/marketing/LegalLayout";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        <strong>[À COMPLÉTER PAR LE CLIENT]</strong> — raison sociale, forme juridique, numéro RCCM, siège
        social et, le cas échéant, capital social.
      </p>
      <p>
        Directeur de la publication : <strong>[À COMPLÉTER PAR LE CLIENT]</strong>
        <br />
        Contact : <strong>[À COMPLÉTER PAR LE CLIENT — adresse email]</strong>
      </p>

      <h2>Hébergement</h2>
      <p>
        Hébergeur du site (frontend) : <strong>[À COMPLÉTER — ex. Vercel Inc.]</strong>
        <br />
        Hébergeur de l&apos;application et de la base de données (backend) :{" "}
        <strong>[À COMPLÉTER — ex. Render / Railway, base de données Neon]</strong>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site R3S3IGN3M3NT (structure, textes, logo, code source) est protégé
        au titre du droit d&apos;auteur, sauf mention contraire. Toute reproduction non autorisée est
        interdite.
      </p>

      <h2>Droit applicable</h2>
      <p>
        Le présent site est soumis au droit ivoirien. À défaut de résolution amiable, les tribunaux
        compétents de Côte d&apos;Ivoire seront seuls saisis.
      </p>

      <div className="legal-warning">
        Ce document est un brouillon structuré, pas un avis juridique. Il doit être complété avec les
        informations réelles de l&apos;éditeur (RCCM, hébergeur définitif, contact) et validé par un
        professionnel du droit avant toute mise en ligne commerciale.
      </div>
    </LegalLayout>
  );
}
