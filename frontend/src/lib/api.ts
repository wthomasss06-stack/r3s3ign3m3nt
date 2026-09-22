import axios from "axios";

import { refreshOnce } from "./authClient";
import { getAccessToken, setAccessToken } from "./tokenStore";
import { normalizeApiError } from "./errors";
import { clearSessionCache, readSessionCache } from "./sessionStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const REQUEST_TIMEOUT_MS = 12_000;

// Le refresh token reste dans un cookie httpOnly ; le JWT d’accès est seulement
// ajouté à la requête depuis la mémoire/localStorage.
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=").slice(1).join("=") || "";
}

const isSessionEndpoint = (url = "") => /\/auth\/(csrf|token\/refresh|google|logout)\//.test(url);

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  const method = (config.method || "").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrf = readCookie("csrftoken");
    if (csrf && config.headers) config.headers["X-CSRFToken"] = decodeURIComponent(csrf);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    error.appError = normalizeApiError(error);
    if (!error.response) {
      error.category = error.code === "ECONNABORTED" ? "timeout" : "network";
      error.retryable = true;
    } else if (error.response.status === 429 || error.response.status >= 500) {
      error.category = error.response.status === 429 ? "rate-limit" : "server";
      error.retryable = true;
    } else if (error.response.status === 401 || error.response.status === 403) {
      error.category = "auth";
      error.retryable = false;
    }

    const originalRequest = error.config;
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isSessionEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const result = await refreshOnce();
    if (result.ok && result.access) {
      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${result.access}`;
      return apiClient(originalRequest);
    }
    if (result.transient) {
      // Une panne réseau/cold start ne doit pas effacer la session locale.
      return Promise.reject(Object.assign(error, { transient: true }));
    }

    setAccessToken(null);
    clearSessionCache();
    if (typeof window !== "undefined" && !readSessionCache()) window.location.href = "/";
    return Promise.reject(error);
  },
);
