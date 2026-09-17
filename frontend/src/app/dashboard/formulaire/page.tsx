"use client";
import { useEffect, useState } from "react";

import Loader from "@/components/Loader";
import FormBuilder from "@/components/FormBuilder";
import { apiClient } from "@/lib/api";
import type { FormField } from "@/types";

type ViewState = "loading" | "error" | "ready";

export default function FormulairePage() {
  const [schema, setSchema] = useState<FormField[]>([]);
  const [state, setState] = useState<ViewState>("loading");

  const load = () => {
    setState("loading");
    apiClient
      .get<{ fields_schema: FormField[] }>("/form-template/")
      .then((res) => {
        setSchema(res.data.fields_schema);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  if (state === "loading") return <Loader fullScreen={false} />;
  if (state === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-ink-soft">Impossible de charger le formulaire.</p>
        <button
          onClick={load}
          className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-white transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Formulaire</h1>
        <p className="text-sm text-ink-soft">Ce que les visiteurs remplissent en scannant le QR.</p>
      </div>
      <FormBuilder initialSchema={schema} />
    </div>
  );
}
