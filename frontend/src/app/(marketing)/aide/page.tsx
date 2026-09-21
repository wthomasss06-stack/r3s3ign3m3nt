import type { Metadata } from "next";
import LegalLayout from "@/components/marketing/LegalLayout";

export const metadata: Metadata = { title: "Aide" };

export default function AidePage() {
  return <LegalLayout title="Aide">
    <h2>Pour le Patron</h2>
    <h3>Comment créer mon espace ?</h3><p>Clique sur « Se connecter » et utilise ton compte Google. L’onboarding te guide pour choisir ton rôle, renseigner l’établissement, configurer le formulaire et afficher le QR.</p>
    <h3>Comment configurer l’établissement ?</h3><p>Ajoute le nom et le logo, puis définis les motifs de visite. Le logo apparaît dans l’interface, le formulaire public et au centre du QR.</p>
    <h3>Comment gérer mon équipe ?</h3><p>Invite un Gérant ou un membre Staff par email. La personne doit se connecter avec le compte Google invité pour être rattachée à l’établissement.</p>
    <h3>À quoi sert le Mode staff ?</h3><p>Le Patron ou le Gérant peut ouvrir Dashboard → Mode staff lorsqu’aucun agent n’est disponible. Le QR s’affiche en grand et un bouton ouvre directement le formulaire pour une tablette d’accueil.</p>
    <h3>Comment lire les statistiques ?</h3><p>Dashboard → Registre affiche le volume total, le volume du jour, l’heure de pointe, la répartition horaire et les motifs fréquents. Le registre et les statistiques s’actualisent automatiquement toutes les 30 secondes.</p>
    <h3>Comment récupérer mes données ?</h3><p>Dashboard → Registre → Exporter en CSV.</p>

    <h2>Pour le Gérant et le Staff</h2>
    <p>Le Gérant peut gérer les opérations autorisées, tandis que le Staff consulte le registre et utilise l’accueil. Les actions sensibles, comme renommer l’établissement, inviter des membres ou régénérer le QR, restent réservées au Patron.</p>

    <h2>Pour le visiteur</h2>
    <h3>Dois-je créer un compte ?</h3><p>Non. Scanne le QR ou utilise la tablette d’accueil : aucun compte visiteur n’est nécessaire.</p>
    <h3>Et si je n’ai pas de réseau ou de téléphone ?</h3><p>L’établissement peut fournir une tablette. Le formulaire peut conserver les données localement et les synchroniser lorsque l’appareil retrouve Internet.</p>
    <h3>Que devient ma signature ?</h3><p>Elle est enregistrée avec la fiche lorsque le formulaire la demande et reste accessible uniquement aux membres autorisés de l’établissement.</p>
    <div className="legal-warning">Une question qui ne trouve pas de réponse ici ? <strong>[À COMPLÉTER PAR LE CLIENT — contact]</strong></div>
  </LegalLayout>;
}
