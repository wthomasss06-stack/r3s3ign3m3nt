"use client";

import { useEffect, useState } from "react";

import FormBuilder from "@/components/FormBuilder";
import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import type { FormField, UserProfile } from "@/types";

type ViewState = "loading" | "error" | "ready";

export default function ParametresPage() {
  const [schema, setSchema] = useState<FormField[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [state, setState] = useState<ViewState>("loading");

  const load = () => {
    setState("loading");
    Promise.all([apiClient.get<{ fields_schema: FormField[] }>("/form-template/"), apiClient.get<UserProfile>("/auth/me/")])
      .then(([tpl, me]) => {
        setSchema(tpl.data.fields_schema);
        setUser(me.data);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  if (state === "loading") return <Loader fullScreen={false} />;
  if (state === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-ink-soft">Impossible de charger les paramètres.</p>
        <button
          onClick={load}
          className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-white transition hover:bg-cta-hover"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const canEditForm = user?.role === "BOSS" || user?.role === "GERANT";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Paramètres</h1>
        <p className="text-sm text-ink-soft">Formulaire visiteur et configuration de ton espace.</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-ink">Formulaire visiteur</h2>
        <p className="mt-1 text-sm text-ink-soft">Ce que les visiteurs remplissent en scannant le QR.</p>
        {canEditForm ? (
          <div className="mt-6">
            <FormBuilder initialSchema={schema} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            Tu n&apos;as pas les droits pour modifier le formulaire. Contacte le patron ou le gérant.
          </p>
        )}
      </section>
    </div>
  );
}
