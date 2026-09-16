import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { CheckInRecord, FormField } from "@/types";

export default function CheckInsTable({
  records,
  activeSchema,
}: {
  records: CheckInRecord[];
  activeSchema: FormField[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-canvas text-ink-soft">
            <tr>
              <th className="whitespace-nowrap p-3 font-medium">Heure d&apos;arrivée</th>
              {activeSchema.map((field) => (
                <th key={field.id} className="whitespace-nowrap p-3 font-medium">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record.id} className="transition hover:bg-canvas/60">
                <td className="whitespace-nowrap p-3 font-medium text-ink">
                  {format(new Date(record.created_at_client), "HH:mm — dd/MM/yyyy", { locale: fr })}
                </td>
                {activeSchema.map((field) => (
                  <td key={field.id} className="p-3 text-ink-soft">
                    {renderCell(field, record)}
                  </td>
                ))}
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={activeSchema.length + 1} className="p-10 text-center text-ink-soft">
                  Aucun visiteur enregistré pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCell(field: FormField, record: CheckInRecord) {
  if (field.type === "signature") {
    return record.signature_blob ? (
      <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs text-success-text">Signé</span>
    ) : (
      <span>—</span>
    );
  }
  if (field.type === "checkbox") {
    return record.responses[field.id] ? "Oui" : "Non";
  }
  const value = record.responses[field.id];
  return value !== undefined && value !== "" ? String(value) : <span>—</span>;
}
