"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import FormBuilder from "@/components/FormBuilder";
import { apiClient } from "@/lib/api";
import type { FormField, UserProfile } from "@/types";

const ROLE_OPTIONS = [
  {
    value: "BOSS",
    title: "Je suis le patron",
    description: "J’ai le contrôle total de mon établissement, du formulaire et du QR.",
  },
  {
    value: "GERANT",
    title: "Je suis le gérant",
    description: "Je peux gérer le formulaire, le QR et le suivi sans être le propriétaire unique.",
  },
  {
    value: "STAFF",
    title: "Je suis un membre du staff",
    description: "Je consulte le registre, mais je n’ai pas les droits de configuration.",
  },
] as const;

const DEFAULT_SCHEMA: FormField[] = [
  { id: "nom", type: "text", label: "Nom & Prénoms", required: true },
  { id: "telephone", type: "phone", label: "Téléphone / WhatsApp", required: true },
  { id: "motif", type: "select", label: "Motif de la visite", required: false, options: ["Rendez-vous", "Livraison", "Autre"] },
  { id: "signature", type: "signature", label: "Signature", required: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<"BOSS" | "GERANT" | "STAFF">("BOSS");
  const [savingRole, setSavingRole] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formReady, setFormReady] = useState(false);
  const [orgName, setOrgName] = useState("Mon établissement");

  const selectedRoleInfo = useMemo(
    () => ROLE_OPTIONS.find((role) => role.value === selectedRole) ?? ROLE_OPTIONS[0],
    [selectedRole]
  );

  const saveRole = async () => {
    setSavingRole(true);
    setSaveError(null);
    try {
      const { data } = await apiClient.patch<UserProfile>("/auth/me/role/", { role: selectedRole });
      if (data.role === "BOSS" || data.role === "GERANT") {
        setOrgName("Mon établissement");
      }
      setStep(2);
    } catch {
      setSaveError("Impossible d’enregistrer ton rôle pour le moment.");
    } finally {
      setSavingRole(false);
    }
  };

  const saveFormAndNext = async () => {
    setFormReady(true);
    setStep(3);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-3 text-sm text-ink-soft">
          {[1, 2, 3].map((value) => (
            <div key={value} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${
                  step === value ? "bg-cta text-white" : "bg-canvas text-ink-soft"
                }`}
              >
                {value}
              </div>
              {value < 3 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-ink-soft">Étape 1</p>
              <h1 className="mt-2 text-3xl font-heading font-bold text-ink">Qui êtes-vous ?</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedRole === role.value
                      ? "border-cta bg-cta/5 shadow-sm"
                      : "border-border bg-canvas hover:border-ink"
                  }`}
                >
                  <p className="text-lg font-semibold text-ink">{role.title}</p>
                  <p className="mt-2 text-sm text-ink-soft">{role.description}</p>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-canvas p-4">
              <p className="text-sm text-ink-soft">Rôle sélectionné</p>
              <p className="mt-2 text-lg font-semibold text-ink">{selectedRoleInfo.title}</p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink-soft">Le patron garde les permissions complètes.</p>
              <button
                type="button"
                onClick={saveRole}
                disabled={savingRole}
                className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white hover:bg-cta-hover disabled:opacity-60"
              >
                {savingRole ? "Enregistrement..." : "Continuer"}
              </button>
            </div>
            {saveError && <p className="text-sm text-error-text">{saveError}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-ink-soft">Étape 2</p>
              <h2 className="mt-2 text-3xl font-heading font-bold text-ink">Configure ton formulaire</h2>
            </div>

            <FormBuilder initialSchema={DEFAULT_SCHEMA} onSaved={saveFormAndNext} />

            {formReady && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white hover:bg-cta-hover"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-ink-soft">Étape 3</p>
              <h2 className="mt-2 text-3xl font-heading font-bold text-ink">Ton QR et vos invitations</h2>
            </div>

            <div className="rounded-2xl border border-border bg-canvas p-5">
              <p className="text-sm text-ink-soft">Établissement</p>
              <p className="mt-2 text-xl font-semibold text-ink">{orgName}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white hover:bg-cta-hover"
              >
                Accéder au tableau de bord
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/equipe")}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:border-ink"
              >
                Inviter un membre
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/qr-code")}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:border-ink"
              >
                Voir le QR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
