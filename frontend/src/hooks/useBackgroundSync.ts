"use client";
import { useEffect } from "react";
import axios from "axios";

import { db } from "@/lib/db";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BATCH_SIZE = 20; // marge sous MAX_BATCH_SIZE=50 côté serveur

interface SyncItemResult {
  idempotency_key: string;
  status: string;
}

/** A monter une fois au niveau de la page visiteur : vide la file "pending" des
 * qu'un evenement 'online' survient, sans notification ni action de l'utilisateur. */
export function useBackgroundSync() {
  useEffect(() => {
    const syncPending = async () => {
      const pending = await db.checkins.where("sync_status").equals("pending").limit(BATCH_SIZE).toArray();
      if (pending.length === 0) return;

      try {
        const { data } = await axios.post<{ processed: SyncItemResult[] }>(
          `${API_URL}/checkins/sync/`,
          { checkins: pending },
          { timeout: 15000 }
        );
        const synced = data.processed
          .filter((p) => p.status === "created" || p.status === "already_exists")
          .map((p) => p.idempotency_key);

        await Promise.all(synced.map((key) => db.checkins.update(key, { sync_status: "synced" })));
      } catch {
        // Toujours hors-ligne : on reessaiera au prochain 'online' ou remontage.
      }
    };

    window.addEventListener("online", syncPending);
    if (navigator.onLine) syncPending();

    return () => window.removeEventListener("online", syncPending);
  }, []);
}
