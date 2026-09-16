import type { CheckInRecord, FormField } from "@/types";

export function exportToCSV(records: CheckInRecord[], schema: FormField[], orgName: string): void {
  if (records.length === 0) return;

  const headers = ["Heure d'arrivée", ...schema.map((f) => f.label)];
  const rows = records.map((record) => {
    const time = new Date(record.created_at_client).toLocaleString("fr-FR");
    const cells = schema.map((field) => {
      const raw =
        field.type === "signature"
          ? record.signature_blob
            ? "Signé"
            : "Non signé"
          : record.responses[field.id] ?? "";
      return `"${String(raw).replace(/"/g, '""')}"`;
    });
    return [time, ...cells].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM = accents lisibles dans Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `registre_${orgName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
