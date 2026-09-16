"use client";
import { useEffect, useState } from "react";

import CheckInsTable from "@/components/CheckInsTable";
import { apiClient } from "@/lib/api";
import { exportToCSV } from "@/lib/exportCsv";
import type { CheckInRecord, FormField, Organization, PaginatedResponse } from "@/types";

type ViewState = "loading" | "error" | "ready";

interface FormTemplateResponse {
  fields_schema: FormField[];
}

export default function RegistrePage() {
  const [schema, setSchema] = useState<FormField[]>([]);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [orgName, setOrgName] = useState("");
  const [state, setState] = useState<ViewState>("loading");

  const load = () => {
    setState("loading");
    Promise.all([
      apiClient.get<FormTemplateResponse>("/form-template/"),
      apiClient.get<PaginatedResponse<CheckInRecord>>("/checkins/"),
      apiClient.get<Organization>("/org/me/"),
    ])
      .then(([tpl, chk, org]) => {
        setSchema(tpl.data.fields_schema);
        setRecords(chk.data.results);
        setOrgName(org.data.name);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  if (state === "loading") return <p className="text-ink-soft">Chargement...</p>;
  if (state === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-ink-soft">Impossible de charger le registre.</p>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Registre</h1>
          <p className="text-sm text-ink-soft">
            {records.length} visiteur{records.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => exportToCSV(records, schema, orgName)}
          disabled={records.length === 0}
          className="rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-white transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover disabled:opacity-50"
        >
          Exporter en CSV
        </button>
      </div>
      <CheckInsTable records={records} activeSchema={schema} />
    </div>
  );
}
