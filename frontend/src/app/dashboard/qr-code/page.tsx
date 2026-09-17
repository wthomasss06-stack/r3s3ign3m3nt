"use client";
import { useEffect, useState } from "react";

import Loader from "@/components/Loader";
import QRCodeManager from "@/components/QRCodeManager";
import { apiClient } from "@/lib/api";
import type { Organization, UserProfile } from "@/types";

type ViewState = "loading" | "error" | "ready";

export default function QRCodePage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [state, setState] = useState<ViewState>("loading");

  const load = () => {
    setState("loading");
    Promise.all([apiClient.get<Organization>("/org/me/"), apiClient.get<UserProfile>("/auth/me/")])
      .then(([orgRes, meRes]) => {
        setOrg(orgRes.data);
        setCanRegenerate(meRes.data.role === "BOSS");
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  if (state === "loading") return <Loader fullScreen={false} />;
  if (state === "error" || !org) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-ink-soft">Impossible de charger le QR Code.</p>
        <button
          onClick={load}
          className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-white transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">QR Code</h1>
      <QRCodeManager qrToken={org.qr_secure_token} orgName={org.name} canRegenerate={canRegenerate} />
    </div>
  );
}
