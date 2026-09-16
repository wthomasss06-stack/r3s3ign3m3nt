import axios from "axios";

import { refreshOnce } from "./authClient";
import { getAccessToken, setAccessToken } from "./tokenStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// withCredentials : obligatoire pour que le cookie httpOnly de refresh circule
// (cross-site entre le frontend Vercel et le backend Render/Railway).
export const apiClient = axios.create({ baseURL: API_URL, withCredentials: true });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const result = await refreshOnce();

      if (result.ok && result.access) {
        originalRequest.headers.Authorization = `Bearer ${result.access}`;
        return apiClient(originalRequest);
      }
      if (result.transient) {
        // Cold start / reseau : on NE deconnecte PAS. L'appelant peut proposer "Réessayer".
        return Promise.reject(Object.assign(error, { transient: true }));
      }
      setAccessToken(null);
      if (typeof window !== "undefined") window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
