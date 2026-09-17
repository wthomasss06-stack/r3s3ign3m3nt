"use client";
import { GoogleLogin } from "@react-oauth/google";

import Logo from "@/components/Logo";
import { useGoogleAuthLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, error } = useGoogleAuthLogin();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 py-20">
      <div className="text-center">
        <Logo size={44} className="mx-auto" />
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em]">Se connecter</h1>
        <p className="mt-2 text-sm text-mk-ink/70">Réservé au patron et à son équipe.</p>
      </div>

      <div className="w-full max-w-sm rounded-[1.4rem] border border-mk-ink/10 bg-white/60 p-8">
        <GoogleLogin
          onSuccess={(res) => res.credential && login(res.credential)}
          onError={() => {}}
          theme="outline"
          shape="rectangular"
          size="large"
          width={272}
        />
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      </div>

      <p className="max-w-xs text-center text-xs text-mk-ink/60">
        Un compte Google suffit, aucun mot de passe à retenir. Première connexion = ton espace est créé
        automatiquement.
      </p>
    </div>
  );
}
