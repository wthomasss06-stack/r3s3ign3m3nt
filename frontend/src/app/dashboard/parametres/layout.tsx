"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Loader from "@/components/Loader";
import FeedbackWidget from "@/components/FeedbackWidget";
import { apiClient } from "@/lib/api";
import type { UserProfile } from "@/types";

const ALL_TABS = [
  { href: "/dashboard/parametres/formulaire", label: "Formulaire", staffCanSee: false },
  { href: "/dashboard/parametres/qr-code", label: "QR Code", staffCanSee: true },
  { href: "/dashboard/parametres/equipe", label: "Équipe", staffCanSee: false },
  { href: "/dashboard/parametres/entreprise", label: "Entreprise", staffCanSee: true },
];

export default function ParametresLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserProfile["role"] | null>(null);

  useEffect(() => {
    apiClient.get<UserProfile>("/auth/me/").then((res) => setRole(res.data.role));
  }, []);

  if (!role) return <Loader fullScreen={false} />;

  const tabs = ALL_TABS.filter((tab) => role !== "STAFF" || tab.staffCanSee);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Paramètres</h1>
        <p className="text-sm text-ink-soft">Formulaire, QR Code et équipe de ton établissement.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              pathname === tab.href
                ? "border-cta text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
      <FeedbackWidget />
    </div>
  );
}
