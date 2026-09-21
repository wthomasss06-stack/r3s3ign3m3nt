"use client";
import { useEffect, useState } from "react";

import InviteStaff from "@/components/dashboard/InviteStaff";
import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import type { UserProfile } from "@/types";

type ViewState = "loading" | "error" | "ready";

export default function EquipePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [state, setState] = useState<ViewState>("loading");

  const load = () => {
    setState("loading");
    apiClient
      .get<UserProfile>("/auth/me/")
      .then((res) => {
        setUser(res.data);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  if (state === "loading") return <Loader fullScreen={false} />;
  if (state === "error" || !user) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-ink-soft">Impossible de charger cette page.</p>
        <button
          onClick={load}
          className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-cta-ink transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Équipe</h1>
        <p className="text-sm text-ink-soft">Invite un Gérant ou un Staff selon les permissions nécessaires.</p>
      </div>
      <InviteStaff viewerRole={user.role === "BOSS" ? "BOSS" : "GERANT"} />
    </div>
  );
}
