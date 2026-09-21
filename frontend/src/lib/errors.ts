import axios from "axios";

export type AppError = { message: string; code: string; retryable: boolean; status: number | null };

export function normalizeApiError(error: unknown): AppError {
  if (!axios.isAxiosError(error)) return { message: "Une erreur inattendue est survenue.", code: "unknown", retryable: false, status: null };
  const status = error.response?.status ?? null;
  const payload = error.response?.data?.error;
  return {
    message: payload?.message || (status && status >= 500 ? "Le service est temporairement indisponible." : "La requête n’a pas pu être traitée."),
    code: payload?.code || `http_${status ?? "network"}`,
    retryable: payload?.retryable ?? (status === null || Boolean(status && status >= 500)),
    status,
  };
}
