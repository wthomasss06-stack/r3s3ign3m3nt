"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Check } from "@phosphor-icons/react";

import Logo from "@/components/Logo";
import InviteStaff from "@/components/dashboard/InviteStaff";
import SimpleFormSetup from "@/components/onboarding/SimpleFormSetup";
import QRCodeManager from "@/components/QRCodeManager";
import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import { PERMISSION_MATRIX } from "@/lib/roles";
import type { AccountRole, Organization, UserProfile } from "@/types";

const ROLE_OPTIONS = [
  {
    value: "BOSS" as const,
    title: "Je suis le patron",
    description: "Contrôle total : équipe, QR, formulaire et registre.",
  },
  {
    value: "GERANT" as const,
    title: "Je suis le gérant",
    description: "Gère le quotidien : registre, formulaire et QR (sans invitations).",
  },
  {
    value: "STAFF" as const,
    title: "Je suis un membre du staff",
    description: "Consulte le registre uniquement.",
  },
];

const STEPS = [
  { n: 1, label: "Profil" },
  { n: 2, label: "Formulaire" },
  { n: 3, label: "QR & équipe" },
] as const;

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: "" };
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export default function OnboardingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedRole, setSelectedRole] = useState<AccountRole>("BOSS");
  const [savingStep1, setSavingStep1] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [formDone, setFormDone] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  useEffect(() => {
    apiClient
      .get<UserProfile>("/auth/me/")
      .then((res) => {
        const { firstName: fn, lastName: ln } = splitName(res.data.full_name);
        setFirstName(fn);
        setLastName(ln);
        setAvatarUrl(res.data.avatar_url ?? "");
        setSelectedRole(res.data.role);
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    if (step !== 3) return;
    setLoadingOrg(true);
    apiClient
      .get<Organization>("/org/me/")
      .then((res) => setOrg(res.data))
      .finally(() => setLoadingOrg(false));
  }, [step]);

  const selectedRoleInfo = useMemo(
    () => ROLE_OPTIONS.find((r) => r.value === selectedRole) ?? ROLE_OPTIONS[0],
    [selectedRole]
  );

  const matrixKey = selectedRole === "BOSS" ? "boss" : selectedRole === "GERANT" ? "gerant" : "staff";

  const saveProfileAndRole = async () => {
    setSavingStep1(true);
    setStep1Error(null);
    const full_name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    try {
      await apiClient.patch("/auth/me/", { full_name, avatar_url: avatarUrl });
      await apiClient.patch<UserProfile>("/auth/me/role/", { role: selectedRole });
      setStep(2);
    } catch {
      setStep1Error("Impossible d'enregistrer ton profil. Réessaie.");
    } finally {
      setSavingStep1(false);
    }
  };

  const onAvatarPick = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 800_000) {
      setStep1Error("Photo trop lourde (max 800 Ko).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setStep1Error(null);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loadingProfile) return <Loader label="Préparation de ton espace…" />;

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <header className="flex items-center border-b border-border bg-surface px-page-x py-4">
        <div className="sm:hidden">
          <Logo size={48} back />
        </div>
        <div className="hidden sm:block">
          <Logo size={56} back />
        </div>
      </header>

      <div className="onboarding-shell">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {STEPS.map(({ n, label }, idx) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold sm:h-10 sm:w-10 ${
                  step === n ? "bg-cta text-white" : step > n ? "bg-success-bg text-success-text" : "bg-surface text-ink-soft ring-1 ring-border"
                }`}
              >
                {step > n ? <Check size={16} weight="bold" /> : n}
              </div>
              <span className={`hidden text-sm sm:inline ${step === n ? "font-medium text-ink" : "text-ink-soft"}`}>
                {label}
              </span>
              {idx < STEPS.length - 1 && <div className="mx-1 hidden h-px w-6 bg-border sm:block" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-subtle sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Étape 1</p>
                <h1 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">Ton profil</h1>
                <p className="mt-2 text-sm text-ink-soft">
                  Infos récupérées depuis Google — vérifie et choisis ton rôle.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-canvas"
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-ink-soft">
                      <Camera size={28} />
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-xs text-white opacity-0 transition group-hover:opacity-100">
                    Changer
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onAvatarPick(e.target.files?.[0])}
                />
                <div className="grid w-full gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-ink-soft">Prénom</span>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-ink-soft">Nom</span>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedRole === role.value
                        ? "border-cta bg-cta/5 ring-1 ring-cta/20"
                        : "border-border bg-canvas hover:border-ink/30"
                    }`}
                  >
                    <p className="font-semibold text-ink">{role.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-soft">{role.description}</p>
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-canvas p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                  Permissions — {selectedRoleInfo?.title ?? "Rôle"}
                </p>
                <table className="mt-3 w-full min-w-[280px] text-left text-sm">
                  <tbody>
                    {PERMISSION_MATRIX.map((row) => (
                      <tr key={row.label} className="border-t border-border/60 first:border-0">
                        <td className="py-2 pr-4 text-ink">{row.label}</td>
                        <td className="py-2 text-right">
                          {row[matrixKey] ? (
                            <Check size={18} weight="bold" className="ml-auto text-success-text" />
                          ) : (
                            <span className="text-ink-soft">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={saveProfileAndRole}
                  disabled={savingStep1 || !firstName.trim()}
                  className="rounded-full bg-cta px-6 py-2.5 text-sm font-medium text-white hover:bg-cta-hover disabled:opacity-60"
                >
                  {savingStep1 ? "Enregistrement…" : "Continuer"}
                </button>
              </div>
              {step1Error && <p className="text-sm text-error-text">{step1Error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Étape 2</p>
                <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">Ton formulaire visiteur</h2>
                <p className="mt-2 text-sm text-ink-soft">Simple et rapide — personnalisation avancée dans les paramètres.</p>
              </div>

              {(selectedRole === "BOSS" || selectedRole === "GERANT") && (
                <SimpleFormSetup
                  onSaved={() => {
                    setFormDone(true);
                    setStep(3);
                  }}
                />
              )}

              {selectedRole === "STAFF" && (
                <div className="rounded-xl border border-border bg-canvas p-5 text-sm text-ink-soft">
                  En tant que staff, tu n&apos;as pas besoin de configurer le formulaire. Passe à l&apos;étape suivante.
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:border-ink"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white hover:bg-cta-hover"
                >
                  {formDone || selectedRole === "STAFF" ? "Continuer" : "Passer pour l'instant"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Étape 3</p>
                <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">Ton QR & invitations</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Affiche le QR à l&apos;accueil. Invite ton équipe quand tu es prêt.
                </p>
              </div>

              {loadingOrg ? (
                <Loader fullScreen={false} label="Chargement du QR…" />
              ) : org ? (
                <div className="flex justify-center">
                  <QRCodeManager
                    qrToken={org.qr_secure_token}
                    orgName={org.name}
                    canRegenerate={selectedRole === "BOSS"}
                  />
                </div>
              ) : (
                <p className="text-sm text-ink-soft">QR indisponible pour le moment.</p>
              )}

              {selectedRole === "BOSS" && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-ink">Inviter un membre</h3>
                  <InviteStaff />
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:border-ink"
                >
                  Retour
                </button>
                <div className="flex flex-wrap gap-3">
                  {selectedRole === "BOSS" && (
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/equipe")}
                      className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:border-ink"
                    >
                      Inviter plus tard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="rounded-full bg-cta px-6 py-2.5 text-sm font-medium text-white hover:bg-cta-hover"
                  >
                    {selectedRole === "BOSS" ? "Passer" : "Accéder au tableau de bord"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
