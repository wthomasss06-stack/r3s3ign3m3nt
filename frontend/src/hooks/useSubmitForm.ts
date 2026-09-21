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
    };

    // Ecriture locale immediate : le visiteur ne doit jamais attendre le reseau.
    await db.checkins.add(checkin);
    setStatus("saved_offline");

    if (await networkMonitor.check()) {
      try {
        await axios.post(`${API_URL}/checkins/sync/`, { checkins: [checkin] }, { timeout: 8000 });
        await db.checkins.update(checkin.idempotency_key, { sync_status: "synced" });
        setStatus("synced");
      } catch {
        // Reseau instable : useBackgroundSync() rattrapera l'envoi plus tard.
      }
    }
  };

  return { submitForm, status };
}
