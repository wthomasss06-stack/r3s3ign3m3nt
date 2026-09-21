"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { CheckInRecord, FormField } from "@/types";

export default function CheckInsTable({ records, activeSchema }: { records: CheckInRecord[]; activeSchema: FormField[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updatePageSize = () => setPageSize(mediaQuery.matches ? 10 : 20);
    updatePageSize();
    mediaQuery.addEventListener("change", updatePageSize);
    return () => mediaQuery.removeEventListener("change", updatePageSize);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [records]);

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [currentPage, pageSize, records]);
  const firstVisible = records.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastVisible = Math.min(currentPage * pageSize, records.length);

  return <div className="overflow-hidden rounded-xl border border-border bg-surface">
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border bg-canvas text-ink-soft"><tr><th className="whitespace-nowrap p-3 font-medium">Heure d&apos;arrivée</th>{activeSchema.map((field) => <th key={field.id} className="whitespace-nowrap p-3 font-medium">{field.label}</th>)}</tr></thead><tbody className="divide-y divide-border">{visibleRecords.map((record) => <tr key={record.id} className="transition hover:bg-canvas/60"><td className="whitespace-nowrap p-3 font-medium text-ink">{format(new Date(record.created_at_client), "HH:mm — dd/MM/yyyy", { locale: fr })}</td>{activeSchema.map((field) => <td key={field.id} className="p-3 text-ink-soft">{renderCell(field, record)}</td>)}</tr>)}{records.length === 0 && <tr><td colSpan={activeSchema.length + 1} className="p-10 text-center text-ink-soft">Aucun visiteur enregistré pour le moment.</td></tr>}</tbody></table></div>
    {records.length > 0 && <div className="flex flex-col gap-3 border-t border-border bg-surface px-3 py-3 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-4"><p>Visiteurs {firstVisible} à {lastVisible} sur {records.length}</p><div className="flex items-center justify-between gap-2 sm:justify-end"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Page précédente" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"><CaretLeft size={14} /> Précédente</button><span aria-live="polite" className="min-w-20 text-center font-medium text-ink">Page {currentPage} / {totalPages}</span><button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="Page suivante" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40">Suivante <CaretRight size={14} /></button></div></div>}
  </div>;
}

function renderCell(field: FormField, record: CheckInRecord) {
  if (field.type === "signature") return record.signature_blob ? <img src={record.signature_blob} alt="Signature du visiteur" className="h-12 max-w-[140px] rounded border border-border bg-white object-contain p-1" /> : <span>—</span>;
  if (field.type === "checkbox") return record.responses[field.id] ? "Oui" : "Non";
  const value = record.responses[field.id]; return value !== undefined && value !== "" ? String(value) : <span>—</span>;
}
