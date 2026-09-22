import { apiClient } from "@/lib/api";

export async function exportAllToCSV(orgName: string): Promise<void> {
  const response = await apiClient.get<Blob>("/checkins/export/", { responseType: "blob" });
  const disposition = String(response.headers["content-disposition"] || "");
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || `registre_${orgName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
