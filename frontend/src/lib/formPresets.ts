import type { FormField } from "@/types";

export interface FormPreset {
  id: string;
  label: string;
  fields: FormField[];
}

// Points de départ suggérés par secteur — le patron peut ensuite tout modifier
// (ajouter, renommer, supprimer des champs) : ce ne sont que des modèles, pas des
// contraintes. "Vierge" couvre le cas freestyle pur.
export const FORM_PRESETS: FormPreset[] = [
  {
    id: "bureau",
    label: "Bureau / Cabinet",
    fields: [
      { id: "nom", type: "text", label: "Nom & Prénoms", required: true },
      { id: "telephone", type: "phone", label: "Téléphone / WhatsApp", required: true },
      { id: "societe", type: "text", label: "Société", required: false },
      { id: "personne_visitee", type: "text", label: "Personne à rencontrer", required: false },
      {
        id: "motif",
        type: "select",
        label: "Motif de la visite",
        options: ["Rendez-vous", "Livraison", "Entretien", "Autre"],
        required: false,
      },
      { id: "signature", type: "signature", label: "Signature", required: true },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    fields: [
      { id: "nom", type: "text", label: "Nom", required: true },
      { id: "telephone", type: "phone", label: "Téléphone / WhatsApp", required: true },
      { id: "personnes", type: "number", label: "Nombre de personnes", required: true },
      {
        id: "occasion",
        type: "select",
        label: "Occasion",
        options: ["Repas", "Réservation", "Événement", "Autre"],
        required: false,
      },
    ],
  },
  {
    id: "hotel",
    label: "Hôtel",
    fields: [
      { id: "nom", type: "text", label: "Nom complet", required: true },
      { id: "telephone", type: "phone", label: "Téléphone", required: true },
      { id: "email", type: "email", label: "Email", required: false },
      { id: "chambre", type: "text", label: "Numéro de chambre", required: false },
      { id: "depart", type: "date", label: "Date de départ prévue", required: false },
      { id: "signature", type: "signature", label: "Signature", required: true },
    ],
  },
  {
    id: "acces-salle",
    label: "Accès salle / Chantier",
    fields: [
      { id: "nom", type: "text", label: "Nom & Prénoms", required: true },
      { id: "societe", type: "text", label: "Société", required: true },
      { id: "telephone", type: "phone", label: "Contact", required: true },
      { id: "fonction", type: "text", label: "Fonction", required: false },
      {
        id: "epi",
        type: "checkbox",
        label: "Je confirme porter les équipements de protection requis",
        required: true,
      },
      { id: "signature", type: "signature", label: "Signature", required: true },
    ],
  },
  {
    id: "vierge",
    label: "Vierge",
    fields: [
      { id: "nom", type: "text", label: "Nom & Prénoms", required: true },
      { id: "signature", type: "signature", label: "Signature", required: true },
    ],
  },
];
