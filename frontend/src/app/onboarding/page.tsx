"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, UserCircle, Users } from "@phosphor-icons/react";

import { ArrowUpRight } from "@/components/icons";
import Loader from "@/components/Loader";
import Logo from "@/components/Logo";
import FormBuilder from "@/components/FormBuilder";
import QRCodeManager from "@/components/QRCodeManager";
import InviteStaff from "@/components/dashboard/InviteStaff";
import { useSilentSession } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import type { FormField, Organization, UserProfile } from "@/types";

type WizardState = "loading" | "error" | "ready";

const ROLE_CARDS = [
  {
    icon: UserCircle,
    title: "Patron (toi)",
    body: "Accès complet : formulaire, QR, équipe, export, paramètres sensibles.",
  },
  {
    icon: ShieldCheck,
    title: "Gérant",
    body: "Gère le formulaire et l'export au quotidien. Ne peut pas régénérer le QR ni inviter un autre gérant.",
  },
  {
    icon: Users,
    title: "Agent",
    body: "Consulte le registre. Ne modifie rien — idéal pour l'accueil au quotidien.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { loading: sessionLoading, isAuthenticated } = useSilentSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [schema, setSchema] = useState<FormField[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [state, setState] = useState<WizardState>("loading");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    Promise.all([
      apiClient.get<UserProfile>("/auth/me/"),
      apiClient.get<{ fields_schema: FormField[] }>("/form-template/"),
      apiClient.get<Organization>("/org/me/"),
    ])
      .then(([me, tpl, orgRes]) => {
        setUser(me.data);
        setSchema(tpl.data.fields_schema);
        setOrg(orgRes.data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [sessionLoading, isAuthenticated, router]);

  if (sessionLoading || state === "loading") return <Loader label="Préparation de ton espace..." />;
  if (state === "error" || !user || !org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-ink-soft">Impossible de charger ton espace.</p>
        <button
          onClick={() => location.reload()}
          className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-cta-ink transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const finish = () => router.push("/dashboard");

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-14">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-heading font-semibold text-ink">R3S3IGN3M3NT</span>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">Étape {step}/3</span>
      </div>

      <div className="mb-10 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-cta" : "bg-border"}`} />
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar externe (Google), pas un asset local optimisable par next/image
              <img src={user.avatar_url} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cta text-lg font-bold text-cta-ink">
                {(user.full_name || user.email).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-ink">Bienvenue, {user.full_name || user.email}</h1>
              <p className="mt-1 text-sm text-ink-soft">
                Ton espace « {org.name} » vient d&apos;être créé. Tu es le <strong>Patron</strong> : tu as tous
                les droits. Voici ce que tu pourras déléguer plus tard à ton équipe.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {ROLE_CARDS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
                <Icon size={22} weight="bold" className="mt-0.5 shrink-0 text-cta" />
                <div>
                  <p className="font-medium text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-cta py-3.5 font-medium text-cta-ink transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover sm:w-auto sm:px-8"
          >
            Continuer <ArrowUpRight size={16} />
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-ink">Ton formulaire</h1>
            <p className="mt-2 text-sm text-ink-soft">
              Choisis un modèle adapté à ton activité, ou pars d&apos;une page vierge. Tu pourras tout modifier
              à tout moment depuis ton dashboard.
            </p>
          </div>
          <FormBuilder initialSchema={schema} />
          <button
            onClick={() => setStep(3)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-cta py-3.5 font-medium text-cta-ink transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover sm:w-auto sm:px-8"
          >
            Continuer <ArrowUpRight size={16} />
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-ink">Ton QR & ton équipe</h1>
            <p className="mt-2 text-sm text-ink-soft">
              Affiche ce QR à l&apos;accueil. Tu peux inviter un gérant ou un agent maintenant, ou le faire
              plus tard depuis le dashboard.
            </p>
          </div>
          <QRCodeManager qrToken={org.qr_secure_token} orgName={org.name} />
          <InviteStaff viewerRole="BOSS" />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={finish}
              className="flex items-center gap-2 rounded-full bg-cta px-6 py-3.5 font-medium text-cta-ink transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover"
            >
              <Check size={16} weight="bold" /> Terminer
            </button>
            <button
              onClick={finish}
              className="rounded-full px-6 py-3.5 text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              Passer pour l&apos;instant
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
