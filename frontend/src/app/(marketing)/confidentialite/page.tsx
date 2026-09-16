import type { Metadata } from "next";

import LegalLayout from "@/components/marketing/LegalLayout";

export const metadata: Metadata = { title: "Politique de confidentialité", robots: { index: false } };

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p><strong>[À COMPLÉTER PAR LE CLIENT]</strong></p>

      <h2>Données collectées</h2>
      <h3>Compte Patron / Agent</h3>
      <p>Email et nom transmis par Google lors de la connexion. Aucun mot de passe n&apos;est stocké — l&apos;authentification repose exclusivement sur Google.</p>

      <h3>Informations visiteur</h3>
      <p>
        Les champs saisis par le visiteur dépendent entièrement du formulaire configuré par chaque Patron
        (nom, téléphone, email, société, motif, etc.), ainsi qu&apos;une signature manuscrite le cas échéant.
        R3S3IGN3M3NT ne définit pas ces champs : c&apos;est le Patron de chaque établissement qui choisit les
        informations demandées à ses visiteurs, sous sa propre responsabilité.
      </p>

      <h3>Données techniques</h3>
      <p>Adresse IP et journaux de connexion standards du serveur, à des fins de sécurité (détection d&apos;abus, limitation du nombre de requêtes).</p>

      <h2>Finalités</h2>
      <ul>
        <li>Fournir le Service (création de compte, gestion du formulaire, registre des visiteurs)</li>
        <li>Sécurité (limitation du nombre de requêtes, prévention des doublons)</li>
        <li><strong>[À COMPLÉTER PAR LE CLIENT]</strong> — toute finalité additionnelle prévue</li>
      </ul>

      <h2>Base légale</h2>
      <p>Exécution du contrat (fourniture du Service) pour les comptes Patron/Agent ; intérêt légitime de l&apos;établissement visité pour les données du visiteur.</p>

      <h2>Destinataires</h2>
      <p>
        Google (authentification uniquement — aucune autre donnée n&apos;est partagée avec Google) et{" "}
        <strong>[À COMPLÉTER PAR LE CLIENT — hébergeur(s) technique(s) retenu(s)]</strong>. Aucun autre
        tiers, aucun service publicitaire ou de mesure d&apos;audience n&apos;est utilisé à ce jour.
      </p>

      <h2>Cookies</h2>
      <p>
        Un seul cookie est utilisé, strictement nécessaire au fonctionnement du Service : un jeton de
        connexion (<em>httpOnly</em>, illisible en JavaScript), permettant de garder le Patron ou l&apos;Agent
        connecté. Aucun cookie de mesure d&apos;audience ni publicitaire n&apos;est déposé.
      </p>

      <h2>Conservation</h2>
      <p><strong>[À COMPLÉTER PAR LE CLIENT]</strong> — durée de conservation des données de visiteurs et des comptes après suppression d&apos;un établissement.</p>

      <h2>Sécurité</h2>
      <p>
        Isolation stricte des données par établissement, validation systématique côté serveur, limitation
        du nombre de requêtes sur les points d&apos;accès publics, et régénération du QR Code possible à
        tout moment par le Patron en cas de doute sur sa confidentialité.
      </p>

      <h2>Droits des personnes</h2>
      <p>
        Conformément à la loi ivoirienne n° 2013-450 relative à la protection des données à caractère
        personnel, toute personne concernée dispose d&apos;un droit d&apos;accès, de rectification et de
        suppression de ses données. Pour l&apos;exercer : <strong>[À COMPLÉTER PAR LE CLIENT — adresse de contact]</strong>.
      </p>

      <div className="legal-warning">
        Validation juridique recommandée : la collecte de données de visiteurs (y compris signatures) par
        chaque établissement peut relever d&apos;obligations déclaratives auprès de l&apos;ARTCI. Cette page
        ne remplace pas un avis juridique.
      </div>
    </LegalLayout>
  );
}
