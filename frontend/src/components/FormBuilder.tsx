"use client";
import { useState } from "react";
import { Check, Plus, Trash } from "@phosphor-icons/react";

import { ArrowUpRight } from "@/components/icons";
import { apiClient } from "@/lib/api";
import { FORM_PRESETS } from "@/lib/formPresets";
import type { FieldType, FormField } from "@/types";

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texte court",
  phone: "Téléphone",
  email: "Email",
  number: "Nombre",
  date: "Date",
  select: "Liste déroulante",
  checkbox: "Case à cocher",
  signature: "Signature",
};

let idCounter = 0;
function newFieldId(): string {
  idCounter += 1;
  return `champ_${Date.now()}_${idCounter}`;
}

export default function FormBuilder({
  initialSchema,
  onSaved,
}: {
  initialSchema: FormField[];
  onSaved?: () => void;
}) {
  const [fields, setFields] = useState<FormField[]>(initialSchema);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const applyPreset = (presetFields: FormField[]) => {
    if (fields.length > 0) {
      const confirmed = window.confirm(
        "Remplacer les champs actuels par ce modèle ? Tu pourras toujours les modifier ensuite."
      );
      if (!confirmed) return;
    }
    setFields(presetFields.map((f) => ({ ...f, id: newFieldId() })));
    setSaved(false);
  };

  const addField = () => {
    setFields((prev) => [...prev, { id: newFieldId(), type: "text", label: "Nouveau champ", required: false }]);
    setSaved(false);
  };

  function updateField<K extends keyof FormField>(id: string, key: K, value: FormField[K]) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
    setSaved(false);
  }

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await apiClient.put("/form-template/", { fields_schema: fields });
      setSaved(true);
      onSaved?.();
    } catch {
      setSaveError("Impossible d'enregistrer. Vérifie ta connexion et réessaie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink-soft">Repartir d&apos;un modèle</h2>
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {FORM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.fields)}
              className="rounded-lg border border-border bg-surface p-3 text-left transition hover:border-ink"
            >
              <p className="font-medium text-ink">{preset.label}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{preset.fields.length} champs</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-ink">Champs du formulaire</h2>
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-1 text-sm font-medium text-ink transition hover:text-cta-hover"
          >
            <Plus size={16} weight="bold" /> Ajouter un champ
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="form-field-row">
              <input
                value={field.label}
                onChange={(e) => updateField(field.id, "label", e.target.value)}
                className="rounded-md border border-border bg-canvas p-2.5 text-sm text-ink outline-none focus:border-ink"
                placeholder="Nom du champ"
              />
              <select
                value={field.type}
                onChange={(e) => updateField(field.id, "type", e.target.value as FieldType)}
                className="rounded-md border border-border bg-canvas p-2 text-sm text-ink outline-none focus:border-ink"
              >
                {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {field.type === "select" && (
                <input
                  value={field.options?.join(", ") ?? ""}
                  onChange={(e) =>
                    updateField(
                      field.id,
                      "options",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className="rounded-md border border-border bg-canvas p-2 text-sm text-ink outline-none focus:border-ink sm:w-56"
                  placeholder="Options séparées par une virgule"
                />
              )}
              <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, "required", e.target.checked)}
                  className="h-4 w-4 accent-cta"
                />
                Obligatoire
              </label>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                aria-label="Supprimer ce champ"
                className="self-end text-ink-soft transition hover:text-error-text sm:self-auto"
              >
                <Trash size={18} weight="bold" />
              </button>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-soft">
              Aucun champ pour l&apos;instant — choisis un modèle ci-dessus ou ajoute tes propres champs.
            </p>
          )}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving || fields.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-full bg-cta px-6 py-3 font-medium text-white transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            "Enregistrement..."
          ) : saved ? (
            <>
              <Check size={16} weight="bold" /> Enregistré
            </>
          ) : (
            <>
              Enregistrer et déployer <ArrowUpRight size={16} />
            </>
          )}
        </button>
        {saveError && <p className="text-sm text-error-text">{saveError}</p>}
      </div>
    </div>
  );
}
