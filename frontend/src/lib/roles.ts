import type { AccountRole } from "@/types";

export interface PermissionRow {
  label: string;
  boss: boolean;
  gerant: boolean;
  staff: boolean;
}

/** Matrice affichée à l'onboarding — reflète les droits réels côté API. */
export const PERMISSION_MATRIX: PermissionRow[] = [
  { label: "Consulter le registre", boss: true, gerant: true, staff: true },
  { label: "Voir les signatures et statistiques", boss: true, gerant: true, staff: true },
  { label: "Exporter le registre (CSV)", boss: true, gerant: true, staff: false },
  { label: "Créer et modifier plusieurs formulaires", boss: true, gerant: true, staff: false },
  { label: "Activer ou définir le formulaire par défaut", boss: true, gerant: true, staff: false },
  { label: "Supprimer un formulaire", boss: true, gerant: false, staff: false },
  { label: "Créer et modifier des points d’accueil/tablettes", boss: true, gerant: true, staff: false },
  { label: "Afficher / télécharger les QR des points d’accueil", boss: true, gerant: true, staff: false },
  { label: "Désactiver ou supprimer un point d’accueil", boss: true, gerant: false, staff: false },
  { label: "Régénérer le QR", boss: true, gerant: false, staff: false },
  { label: "Inviter des membres", boss: true, gerant: false, staff: false },
  { label: "Renommer l'établissement", boss: true, gerant: false, staff: false },
  { label: "Utiliser le mode Accueil / Staff", boss: true, gerant: true, staff: true },
];

export function permissionsForRole(role: AccountRole): string[] {
  const key = role === "BOSS" ? "boss" : role === "GERANT" ? "gerant" : "staff";
  return PERMISSION_MATRIX.filter((row) => row[key]).map((row) => row.label);
}
