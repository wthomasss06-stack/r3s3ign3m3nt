"use client";
import { useState, type FormEvent } from "react";
import axios from "axios";

import { apiClient } from "@/lib/api";

export default function InviteStaff() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setLink(null);
    try {
      const { data } = await apiClient.post("/auth/invite/", { email });
      setLink(data.invite_link);
      setEmail("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("Cette action est réservée au patron.");
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
        Ajoute l&apos;email de ton agent. Dès qu&apos;il se connectera avec ce compte Google, il sera
        automatiquement rattaché à ton établissement, avec un accès limité (pas de modification du
        formulaire).
      </p>
      <form onSubmit={handleInvite} className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@exemple.com"
          className="flex-1 rounded-md border border-border bg-canvas p-2.5 text-sm text-ink outline-none focus:border-ink"
        />
        <button
          disabled={sending}
          className="rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-white transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover disabled:opacity-50"
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
