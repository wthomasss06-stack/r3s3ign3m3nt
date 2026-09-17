"use client";

import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";

import Logo from "@/components/Logo";
import { useGoogleAuthLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, error, loading } = useGoogleAuthLogin();

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto sm:hidden">
            <Logo size={72} back />
          </div>
          <div className="mx-auto hidden sm:block">
            <Logo size={88} back />
          </div>
          <h1 className="mt-6 font-heading text-fluid-h1 text-balance leading-snug text-mk-ink">
            Le registre digital.
            <br />
            <span className="font-bold">Simple et sans contact.</span>
          </h1>
          <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-mk-moss">
            Réservé au patron et à son équipe — un compte Google suffit.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="google-login-wrap w-full">
            <GoogleLogin
              onSuccess={(res) => res.credential && login(res.credential)}
              onError={() => {}}
              theme="filled_black"
              shape="pill"
              size="large"
              text="continue_with"
              width="280"
            />
          </div>
          {loading && <p className="text-sm text-mk-moss">Connexion en cours…</p>}
          {error && <p className="text-sm text-error-text">{error}</p>}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-mk-moss/90">
          En continuant avec Google, tu acceptes nos{" "}
          <Link href="/cgu" className="underline underline-offset-2 hover:text-mk-ink">
            CGU
          </Link>{" "}
          et notre{" "}
          <Link href="/confidentialite" className="underline underline-offset-2 hover:text-mk-ink">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>

      <p className="mt-6 max-w-xs text-center text-xs text-mk-moss/80">
        Première connexion = ton espace est créé automatiquement.
      </p>
    </div>
  );
}
