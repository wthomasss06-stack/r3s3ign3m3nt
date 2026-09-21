"use client";
import { useState, type FormEvent } from "react";
import axios from "axios";

import { apiClient } from "@/lib/api";

type InviteRole = "GERANT" | "STAFF";

export default function InviteStaff({ viewerRole = "BOSS" }: { viewerRole?: "BOSS" | "GERANT" }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("STAFF");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setLink(null);
    try {
      const { data } = await apiClient.post("/auth/invite/", { email, role });
      setLink(data.invite_link);
      setEmail("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("Cette action est réservée au patron.");
      } else if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError(err.response.data?.error?.message ?? "Requête invalide.");
      } else {
        setError("Impossible d'envoyer l'invitation. Réessaie.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md rounded-xl border border-border bg-surface p-6">
      <p className="mb-4 text-sm text-ink-soft">
        Ajoute l&apos;email de la personne à inviter. Dès qu&apos;elle se connectera avec ce compte Google,
        elle sera automatiquement rattachée à ton établissement.
      </p>
      <form onSubmit={handleInvite} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@exemple.com"
          className="w-full rounded-md border border-border bg-canvas p-2.5 text-sm text-ink outline-none focus:border-ink"
        />

        {viewerRole === "BOSS" ? (
          <div className="flex gap-4 text-sm text-ink">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={role === "STAFF"} onChange={() => setRole("STAFF")} className="accent-cta" />
              Agent (consulte le registre)
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={role === "GERANT"} onChange={() => setRole("GERANT")} className="accent-cta" />
              Gérant (gère aussi le formulaire)
            </label>
          </div>
        ) : (
          <p className="text-xs text-ink-soft">Invité en tant qu&apos;agent — seul le patron peut désigner un gérant.</p>
        )}

        <button
          disabled={sending}
          className="rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-cta-ink transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover disabled:opacity-50"
        >
          {sending ? "..." : "Inviter"}
        </button>
      </form>
      {link && (
        <div className="mt-4 rounded-lg bg-success-bg p-3 text-sm text-success-text">
          Lien à partager (WhatsApp, email...) : <span className="break-all font-medium">{link}</span>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-error-text">{error}</p>}
    </div>
  );
}
