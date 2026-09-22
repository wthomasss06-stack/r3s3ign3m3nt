"use client";
import { useEffect, useState } from "react";
import axios from "axios";

import { db } from "@/lib/db";
import type { PublicFormData } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const FETCH_TIMEOUT_MS = 6_000; // le kiosque ne doit jamais rester bloqué à charger

export type PublicFormStatus = "loading" | "ready" | "not_found" | "never_cached";

/**
 * Formulaire visiteur "kiosque" : tente le réseau avec un timeout court, puis
 * retombe sur le cache local (IndexedDB) si l'appareil est hors-ligne. Un 404
 * serveur (QR désactivé) est une réponse fiable et n'utilise JAMAIS le cache —
 * seul un échec réseau (timeout, offline) déclenche le repli.
 */
export function usePublicForm(qrToken: string) {
  const [data, setData] = useState<PublicFormData | null>(null);
  const [status, setStatus] = useState<PublicFormStatus>("loading");
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await axios.get<PublicFormData>(`${API_URL}/public/forms/${qrToken}/`, {
          timeout: FETCH_TIMEOUT_MS,
        });
        if (cancelled) return;
        setData(res.data);
        setFromCache(false);
        setStatus("ready");
        await db.formCache.put({
          qr_token: qrToken,
          organization_name: res.data.organization_name,
          organization_logo_url: res.data.organization_logo_url || "",
          fields_schema: res.data.fields_schema,
          cached_at: new Date().toISOString(),
        });
        return;
      } catch (err) {
        const serverAnswered = axios.isAxiosError(err) && !!err.response;
        if (serverAnswered) {
          // Le serveur a repondu (ex: 404 QR desactive) : reponse definitive,
          // pas de repli sur un cache potentiellement perime.
          if (!cancelled) setStatus("not_found");
          return;
        }
        // Sinon : timeout, DNS, ou navigator hors-ligne -> on tente le cache.
      }

      const cached = await db.formCache.get(qrToken);
      if (cancelled) return;
      if (cached) {
        setData({
          organization_name: cached.organization_name,
          organization_logo_url: cached.organization_logo_url || "",
          visit_reasons: [],
          fields_schema: cached.fields_schema as PublicFormData["fields_schema"],
          form_id: "cached",
          form_title: "Formulaire visiteur",
          access_point_id: null,
          access_point_name: "Point d’accueil hors ligne",
        });
        setFromCache(true);
        setStatus("ready");
      } else {
        setStatus("never_cached");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [qrToken]);

  return { data, status, fromCache };
}
