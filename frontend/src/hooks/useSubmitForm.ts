"use client";
import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import { networkMonitor } from "@/lib/networkMonitor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type SubmitStatus = "idle" | "saving" | "saved_offline" | "synced";

/**
 * Endpoint public (pas d'auth) : on utilise axios brut, pas apiClient
 * (reserve au dashboard authentifie) — separation volontaire des deux mondes.
 */
export function useSubmitForm(qrToken: string) {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const submitForm = async (responses: Record<string, string | boolean>, signatureBlob: string) => {
    setStatus("saving");

    const checkin = {
      idempotency_key: uuidv4(),
      qr_token: qrToken,
      responses,
      signature_blob: signatureBlob,
    created_at_client: new Date().toISOString(),
    sync_status: "pending" as const,
    retry_count: 0,
    next_retry_at: null,
    last_error: null,
  };

    // Ecriture locale immediate : le visiteur ne doit jamais attendre le reseau.
    await db.checkins.add(checkin);
    window.dispatchEvent(new CustomEvent("qr:sync-updated"));
    setStatus("saved_offline");

    if (await networkMonitor.check()) {
      try {
        const { data } = await axios.post<{ processed?: Array<{ idempotency_key: string; status: string; message?: string }> }>(`${API_URL}/checkins/sync/`, { checkins: [checkin] }, { timeout: 8000 });
        const result = data.processed?.find((item) => item.idempotency_key === checkin.idempotency_key);
        if (result?.status === "created" || result?.status === "already_exists") {
          await db.checkins.update(checkin.idempotency_key, { sync_status: "synced", synced_at: new Date().toISOString(), last_attempt_at: new Date().toISOString(), last_error: null });
          setStatus("synced");
        } else {
          await db.checkins.update(checkin.idempotency_key, { sync_status: "pending", retry_count: 1, next_retry_at: new Date(Date.now() + 10_000).toISOString(), last_error: result?.message || "La réponse serveur n’a pas confirmé l’enregistrement." });
        }
        window.dispatchEvent(new CustomEvent("qr:sync-updated"));
      } catch {
        await db.checkins.update(checkin.idempotency_key, { retry_count: 1, next_retry_at: new Date(Date.now() + 10_000).toISOString(), last_error: "Réseau indisponible, nouvelle tentative automatique." });
        window.dispatchEvent(new CustomEvent("qr:sync-updated"));
      }
    }
  };

  return { submitForm, status };
}
