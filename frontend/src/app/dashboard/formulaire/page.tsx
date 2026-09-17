import { redirect } from "next/navigation";

/** Formulaire déplacé dans Paramètres. */
export default function FormulaireRedirectPage() {
  redirect("/dashboard/parametres");
}
