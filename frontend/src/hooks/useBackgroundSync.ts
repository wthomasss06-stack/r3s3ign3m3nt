"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { db, type OfflineCheckIn } from "@/lib/db";
import { networkMonitor, type NetworkStatus } from "@/lib/networkMonitor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BATCH_SIZE = 20;
const MAX_RETRIES = 5;
const RETRY_BASE_MS = 5_000;

export type SyncState = {
  pendingCount: number;
  failedCount: number;
  syncing: boolean;
  network: NetworkStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
};
export type SyncController = SyncState & { retryNow: () => void; refreshState: () => Promise<void> };

function emitSyncUpdate() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("qr:sync-updated"));
}

async function readQueueState(): Promise<Pick<SyncState, "pendingCount" | "failedCount" | "lastSyncedAt" | "lastError">> {
  const items = await db.checkins.toArray();
  const pending = items.filter((item) => item.sync_status === "pending" || item.sync_status === "syncing");
  const failed = items.filter((item) => item.sync_status === "failed");
  const synced = items.filter((item) => item.sync_status === "synced" && item.synced_at).sort((a, b) => String(b.synced_at).localeCompare(String(a.synced_at)));
  const latestError = failed.sort((a, b) => String(b.last_attempt_at).localeCompare(String(a.last_attempt_at)))[0]?.last_error || null;
  return {
    pendingCount: pending.length,
    failedCount: failed.length,
    lastSyncedAt: synced[0]?.synced_at || null,
    lastError: latestError,
  };
}

export function useBackgroundSync(): SyncController {
  const [network, setNetwork] = useState<NetworkStatus>(() => networkMonitor.getStatus());
  const [state, setState] = useState<SyncState>({ pendingCount: 0, failedCount: 0, syncing: false, network: networkMonitor.getStatus(), lastSyncedAt: null, lastError: null });
  const networkRef = useRef(network);
  const syncingRef = useRef(false);

  const refreshState = useCallback(async () => {
    const queue = await readQueueState();
    setState((current) => ({ ...current, ...queue, network: networkRef.current }));
  }, []);

  const syncPending = useCallback(async (includeFailed = false) => {
    if (syncingRef.current || !networkRef.current.browserOnline || !networkRef.current.apiReachable) return;
    syncingRef.current = true;
    setState((current) => ({ ...current, syncing: true, lastError: null }));
    try {
      const now = Date.now();
      const candidates = await db.checkins
        .where("sync_status")
        .anyOf(includeFailed ? ["pending", "failed"] : ["pending"])
        .toArray();
      const eligible = candidates
        .filter((item) => (item.retry_count || 0) < MAX_RETRIES)
        .filter((item) => !item.next_retry_at || new Date(item.next_retry_at).getTime() <= now)
        .sort((a, b) => a.created_at_client.localeCompare(b.created_at_client));
      const batches: OfflineCheckIn[][] = [];
      for (let index = 0; index < eligible.length; index += BATCH_SIZE) batches.push(eligible.slice(index, index + BATCH_SIZE));

      for (const batch of batches) {
        const attemptedAt = new Date().toISOString();
        await db.checkins.bulkPut(batch.map((item) => ({ ...item, sync_status: "syncing" as const, last_attempt_at: attemptedAt })));
        try {
          const { data } = await axios.post<{ processed: Array<{ idempotency_key: string; status: string; message?: string }> }>(
            `${API_URL}/checkins/sync/`,
            { checkins: batch },
            { timeout: 15000 },
          );
          const processed = new Map((data.processed || []).map((result) => [result.idempotency_key, result]));
          await Promise.all(batch.map(async (item) => {
            const result = processed.get(item.idempotency_key);
            if (result?.status === "created" || result?.status === "already_exists") {
              await db.checkins.update(item.idempotency_key, { sync_status: "synced", synced_at: new Date().toISOString(), next_retry_at: null, last_error: null });
              return;
            }
            const retryCount = (item.retry_count || 0) + 1;
            await db.checkins.update(item.idempotency_key, {
              sync_status: retryCount >= MAX_RETRIES ? "failed" : "pending",
              retry_count: retryCount,
              next_retry_at: new Date(Date.now() + RETRY_BASE_MS * 2 ** Math.min(retryCount, 5)).toISOString(),
              last_error: result?.message || `Réponse serveur : ${result?.status || "inconnue"}`,
            });
          }));
        } catch (error) {
          const retryCount = (batch[0]?.retry_count || 0) + 1;
          await Promise.all(batch.map((item) => db.checkins.update(item.idempotency_key, {
            sync_status: retryCount >= MAX_RETRIES ? "failed" : "pending",
            retry_count: retryCount,
            next_retry_at: new Date(Date.now() + RETRY_BASE_MS * 2 ** Math.min(retryCount, 5)).toISOString(),
            last_error: axios.isAxiosError(error) ? (error.code === "ECONNABORTED" ? "Le serveur met trop de temps à répondre." : "Réseau indisponible.") : "Synchronisation impossible.",
          })));
          break;
        }
      }
    } finally {
      const queue = await readQueueState();
      syncingRef.current = false;
      setState((current) => ({ ...current, ...queue, syncing: false, network: networkRef.current }));
      emitSyncUpdate();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((next) => {
      networkRef.current = next;
      setNetwork(next);
      setState((current) => ({ ...current, network: next }));
      if (next.apiReachable) void syncPending(false);
    });
    const onOnline = () => { void networkMonitor.check(); };
    const onVisibility = () => { if (document.visibilityState === "visible") void networkMonitor.check(); };
    const onExternalUpdate = () => { void refreshState(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("qr:sync-updated", onExternalUpdate);
    void refreshState();
    void networkMonitor.check().then((reachable) => { if (reachable) void syncPending(false); });
    return () => {
      unsubscribe();
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("qr:sync-updated", onExternalUpdate);
    };
  }, [refreshState, syncPending]);

  return { ...state, retryNow: () => syncPending(true), refreshState };
}
