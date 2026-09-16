import type { Metadata } from "next";

import LegalLayout from "@/components/marketing/LegalLayout";

export const metadata: Metadata = { title: "Conditions Générales d'Utilisation", robots: { index: false } };

export default function CguPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation">
      <h2>1. Objet</h2>
      <p>
        Les présentes CGU régissent l&apos;accès et l&apos;utilisation de R3S3IGN3M3NT (ci-après « le
        Service »), une application permettant à un établissement (bureau, restaurant, hôtel, accès
        contrôlé) de recueillir les informations de ses visiteurs par QR Code, avec un accès administrateur
        via authentification Google.
      </p>

      <h2>2. Comptes et rôles</h2>
      <ul>
        <li>
          Le <strong>Patron</strong> crée son espace (« Organisation ») en se connectant avec un compte
          Google. Cette première connexion crée automatiquement son espace, un QR Code et un formulaire par
          défaut.
        </li>
        <li>
          Le Patron peut inviter un ou plusieurs <strong>Agents</strong> par adresse email. Le rattachement
          se fait automatiquement à la première connexion Google de l&apos;agent invité avec cette adresse.
        </li>
        <li>Le Service n&apos;utilise aucun mot de passe : l&apos;authentification repose exclusivement sur Google.</li>
      </ul>

      <h2>3. Utilisation du Service</h2>
      <ul>
        <li>
          Le Patron est seul responsable du contenu de son formulaire, notamment de la pertinence et de la
          licéité des informations demandées à ses visiteurs.
        </li>
        <li>Le visiteur remplit le formulaire sans créer de compte et reste responsable de l&apos;exactitude des informations transmises.</li>
        <li>
          Le Service peut fonctionner hors connexion sur l&apos;appareil dédié à l&apos;accueil (« kiosque ») ;
          les données sont alors transmises dès le rétablissement d&apos;une connexion internet sur cet
          appareil.
        </li>
      </ul>

      <h2>4. Disponibilité</h2>
      <p>
        Le Service est fourni « en l&apos;état ». <strong>[À COMPLÉTER PAR LE CLIENT]</strong> — aucun
        engagement de disponibilité (SLA) n&apos;est garanti à ce stade, sauf mention contraire communiquée
        séparément.
      </p>

      <h2>5. Tarification</h2>
      <p>
        <strong>[À COMPLÉTER PAR LE CLIENT]</strong> — grille tarifaire à préciser avant mise en production
        commerciale. Le Service n&apos;intègre pas de module de paiement à la date de rédaction des
        présentes CGU.
      </p>

      <h2>6. Résiliation</h2>
      <p>
        Le Patron peut cesser d&apos;utiliser le Service à tout moment.{" "}
        <strong>[À COMPLÉTER PAR LE CLIENT]</strong> — modalités de suppression du compte et des données
        associées.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Le Service est un outil de collecte et de restitution d&apos;informations. L&apos;éditeur ne saurait
        être tenu responsable d&apos;une utilisation du Service contraire à la réglementation applicable par
        le Patron ou l&apos;un de ses Agents.
      </p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes CGU sont soumises au droit ivoirien.</p>

      <div className="legal-warning">
        Validation juridique recommandée avant mise en ligne commerciale, en particulier sur les clauses de
        disponibilité, de tarification et de résiliation.
      </div>
    </LegalLayout>
  );
}
