import { getAccessToken, setAccessToken } from "./tokenStore";

// Le navigateur appelle le proxy Next.js same-origin afin que le cookie
// httpOnly de refresh ne soit pas traité comme un cookie tiers.
const API_URL = typeof window !== "undefined"
  ? "/api/v1"
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1");
// Render/Railway free tier : un cold start peut prendre 10-30s. On attend large
// avant de conclure a une vraie coupure (skill jwt-auth-resilience).
const REFRESH_TIMEOUT_MS = 12_000;

interface RefreshResult {
  ok: boolean;
  transient: boolean; // true = erreur reseau/serveur temporaire, jamais une deconnexion
  access?: string;
}

let refreshPromise: Promise<RefreshResult> | null = null;

async function doRefresh(): Promise<RefreshResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, transient: false }; // cookie mort/absent -> deconnexion legitime
    }
    if (!res.ok) {
      return { ok: false, transient: true }; // 5xx -> souci serveur passager
    }
    const data = await res.json();
    setAccessToken(data.access);
    return { ok: true, transient: false, access: data.access };
  } catch {
    return { ok: false, transient: true }; // timeout / hors-ligne
  } finally {
    clearTimeout(timer);
  }
}

/** Singleton : deux 401 simultanes (StrictMode, plusieurs requetes en parallele)
 * ne doivent declencher qu'un seul appel de refresh. */
export function refreshOnce(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** Restaure la session au montage (F5, nouvel onglet). Ne renvoie jamais "deconnecte"
 * sur une erreur transitoire : on garde l'utilisateur connecte tant que le cookie
 * n'a pas ete positivement rejete. */
export async function restoreSession(): Promise<boolean> {
  if (getAccessToken()) return true;
  const result = await refreshOnce();
  if (result.transient) return true;
  return result.ok;
}
