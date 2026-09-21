import type { Organization, UserProfile } from "@/types";

const SESSION_KEY = "qr_session_cache_v1";
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;

interface CachedSession {
  user: UserProfile;
  organization: Organization | null;
  savedAt: number;
}

export function readSessionCache(): CachedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null") as CachedSession | null;
    if (!cached?.user || Date.now() - Number(cached.savedAt || 0) > SESSION_TTL) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export function writeSessionCache(user: UserProfile, organization: Organization | null): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user, organization, savedAt: Date.now() })); } catch {}
}

export function clearSessionCache(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(SESSION_KEY); } catch {}
}
