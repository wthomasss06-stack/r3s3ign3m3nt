"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/context/AuthContext";

export function useGoogleAuthLogin() {
  const router = useRouter();
  const { loginWithGoogle, error, loggingIn } = useAuthContext();

  const login = useCallback(async (credential: string) => {
    try {
      const { isNew, name } = await loginWithGoogle(credential);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("qr_login_greeting", JSON.stringify({ isNew, name }));
      }
      router.push(isNew ? "/onboarding" : "/dashboard");
    } catch {
      // Le provider expose déjà l’erreur à l’écran de connexion.
    }
  }, [loginWithGoogle, router]);

  return { login, loading: loggingIn, error };
}

/** Compatibilité avec les layouts existants : la session est maintenant
 * restaurée par AuthProvider dès le premier rendu, puis rafraîchie en arrière-plan. */
export function useSilentSession() {
  const { loading, isAuthenticated } = useAuthContext();
  return { loading, isAuthenticated };
}
