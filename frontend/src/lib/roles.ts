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
  { label: "Exporter le registre (CSV)", boss: true, gerant: true, staff: false },
  { label: "Modifier le formulaire", boss: true, gerant: true, staff: false },
  { label: "Afficher / télécharger le QR", boss: true, gerant: true, staff: false },
  { label: "Régénérer le QR", boss: true, gerant: false, staff: false },
  { label: "Inviter des membres", boss: true, gerant: false, staff: false },
  { label: "Renommer l'établissement", boss: true, gerant: false, staff: false },
];

export function permissionsForRole(role: AccountRole): string[] {
  const key = role === "BOSS" ? "boss" : role === "GERANT" ? "gerant" : "staff";
  return PERMISSION_MATRIX.filter((row) => row[key]).map((row) => row.label);
}
