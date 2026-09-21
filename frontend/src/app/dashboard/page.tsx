"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChartLineUp, Clock, TrendUp, UsersThree } from "@phosphor-icons/react";
import Loader from "@/components/Loader";
import CheckInsTable from "@/components/CheckInsTable";
import { apiClient } from "@/lib/api";
import { exportToCSV } from "@/lib/exportCsv";
import type { CheckInRecord, CheckInStats, FormField, Organization, PaginatedResponse } from "@/types";

type ViewState = "loading" | "error" | "ready";
interface FormTemplateResponse { fields_schema: FormField[]; }

export default function RegistrePage() {
  const [schema, setSchema] = useState<FormField[]>([]);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [orgName, setOrgName] = useState("");
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [state, setState] = useState<ViewState>("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setState("loading");
    try {
      const [tpl, chk, org, summary] = await Promise.all([
        apiClient.get<FormTemplateResponse>("/form-template/"),
        apiClient.get<PaginatedResponse<CheckInRecord>>("/checkins/"),
        apiClient.get<Organization>("/org/me/"),
        apiClient.get<CheckInStats>("/checkins/stats/"),
      ]);
      setSchema(tpl.data.fields_schema);
      setRecords(chk.data.results);
      setOrgName(org.data.name);
      setStats(summary.data);
      setLastUpdated(new Date());
      setState("ready");
    } catch {
      if (initial) setState("error");
    }
  }, []);

  useEffect(() => {
    load(true);
    const timer = window.setInterval(() => load(false), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const maxHourly = useMemo(() => Math.max(...(stats?.hourly.map((item) => item.count) ?? [1]), 1), [stats]);
  if (state === "loading") return <Loader fullScreen={false} />;
  if (state === "error") return <div className="flex flex-col items-start gap-3"><p className="text-ink-soft">Impossible de charger le registre.</p><button onClick={() => load(true)} className="rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-white">Réessayer</button></div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-ink">Registre</h1><p className="text-sm text-ink-soft">{stats?.total ?? records.length} visiteur{(stats?.total ?? records.length) > 1 ? "s" : ""} · actualisation automatique toutes les 30 secondes{lastUpdated ? ` · ${lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}</p></div><button onClick={() => exportToCSV(records, schema, orgName)} disabled={records.length === 0} className="rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">Exporter en CSV</button></div>
    {stats && <section className="grid gap-4 sm:grid-cols-3"><StatCard icon={<UsersThree size={21} />} label="Volume total" value={String(stats.total)} detail={`${stats.today} aujourd’hui`} /><StatCard icon={<Clock size={21} />} label="Heure de pointe" value={stats.peak_hour || "—"} detail="sur l’ensemble des visites" /><StatCard icon={<TrendUp size={21} />} label="Motif principal" value={stats.frequent_reasons[0]?.label || "—"} detail={stats.frequent_reasons[0] ? `${stats.frequent_reasons[0].count} visite${stats.frequent_reasons[0].count > 1 ? "s" : ""}` : "Aucune donnée"} /></section>}
    {stats && <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-xl border border-border bg-surface p-5"><div className="flex items-center gap-2"><ChartLineUp size={20} className="text-ink" /><h2 className="font-heading font-semibold text-ink">Heures de pointe</h2></div><div className="mt-5 flex h-36 items-end gap-1.5">{Array.from({ length: 24 }, (_, hour) => { const item = stats.hourly.find((entry) => entry.hour === hour); const height = item ? Math.max((item.count / maxHourly) * 100, 8) : 3; return <div key={hour} className="group flex min-w-0 flex-1 flex-col items-center gap-1"><div className="relative w-full rounded-t bg-cta/80 transition hover:bg-cta" style={{ height: `${height}%` }} title={`${hour}h : ${item?.count || 0}`} /><span className="text-[9px] text-ink-soft">{hour % 3 === 0 ? `${hour}h` : ""}</span></div>; })}</div></div><div className="rounded-xl border border-border bg-surface p-5"><h2 className="font-heading font-semibold text-ink">Motifs fréquents</h2><div className="mt-4 space-y-3">{stats.frequent_reasons.length === 0 ? <p className="text-sm text-ink-soft">Les motifs apparaîtront après les premières visites.</p> : stats.frequent_reasons.map((item, index) => <div key={item.label} className="flex items-center gap-3"><span className="w-5 text-xs text-ink-soft">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-sm"><span className="truncate text-ink">{item.label}</span><span className="font-medium text-ink">{item.count}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-cta" style={{ width: `${Math.max((item.count / stats.total) * 100, 5)}%` }} /></div></div></div>)}</div></div></section>}
    <CheckInsTable records={records} activeSchema={schema} />
  </div>;
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) { return <div className="rounded-xl border border-border bg-surface p-4"><div className="flex items-center gap-2 text-ink-soft">{icon}<span className="text-xs font-medium uppercase tracking-wide">{label}</span></div><p className="mt-3 truncate text-2xl font-bold text-ink" title={value}>{value}</p><p className="mt-1 text-xs text-ink-soft">{detail}</p></div>; }
