"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { restoreSession } from "@/lib/authClient";
import { setAccessToken } from "@/lib/tokenStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function useGoogleAuthLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (credential: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.post(`${API_URL}/auth/google/`, { credential }, { withCredentials: true });
        setAccessToken(data.access);
        router.push("/dashboard");
      } catch {
        setError("Connexion impossible. Réessaie.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { login, loading, error };
}

/** Restaure la session au montage (F5, nouvel onglet) sans jamais deconnecter sur
 * une erreur transitoire (cold start Render inclus — skill jwt-auth-resilience). */
export function useSilentSession() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    restoreSession().then((ok) => {
      if (!mounted) return;
      setIsAuthenticated(ok);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { loading, isAuthenticated };
}
