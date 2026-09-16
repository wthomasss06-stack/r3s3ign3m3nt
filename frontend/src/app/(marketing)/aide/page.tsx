import type { Metadata } from "next";

import LegalLayout from "@/components/marketing/LegalLayout";

export const metadata: Metadata = { title: "Aide" };

export default function AidePage() {
  return (
    <LegalLayout title="Aide" lastUpdated="">
      <h2>Pour le patron</h2>

      <h3>Comment créer mon compte ?</h3>
      <p>Clique sur « Se connecter » et choisis ton compte Google. Ton espace, ton QR Code et un premier formulaire sont créés automatiquement.</p>

      <h3>Comment personnaliser mon formulaire ?</h3>
      <p>Dashboard → Formulaire. Choisis un modèle (Bureau, Restaurant, Hôtel, Accès salle) ou pars d&apos;une page vierge, puis ajoute, renomme ou supprime des champs librement.</p>

      <h3>Comment fonctionne le mode hors-ligne ?</h3>
      <p>Connecte une tablette ou un téléphone au lien de ton QR Code une première fois, avec internet. L&apos;appareil continue ensuite d&apos;enregistrer les visiteurs même sans réseau — tout se synchronise dès que la connexion revient, sans rien à refaire.</p>

      <h3>Comment inviter un agent ?</h3>
      <p>Dashboard → Équipe → renseigne son email. Dès qu&apos;il se connecte avec ce compte Google, il est automatiquement rattaché à ton établissement, avec un accès limité (il ne peut pas modifier le formulaire).</p>

      <h3>Mon QR a peut-être fuité, que faire ?</h3>
      <p>Dashboard → QR Code → Régénérer. L&apos;ancien QR cesse immédiatement de fonctionner.</p>

      <h3>Comment récupérer mes données ?</h3>
      <p>Dashboard → Registre → Exporter en CSV.</p>

      <h2>Pour le visiteur</h2>

      <h3>Dois-je créer un compte ?</h3>
      <p>Non. Scanner le QR ouvre directement le formulaire, sans compte ni installation.</p>

      <h3>Et si je n&apos;ai pas de réseau ?</h3>
      <p>Tes informations sont sauvegardées sur l&apos;appareil et transmises automatiquement dès que la connexion revient — tu n&apos;as rien à refaire.</p>

      <div className="legal-warning">
        Une question qui ne trouve pas de réponse ici ? <strong>[À COMPLÉTER PAR LE CLIENT — contact]</strong>
      </div>
    </LegalLayout>
  );
}
