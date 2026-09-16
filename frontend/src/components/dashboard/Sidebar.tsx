"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardText, NotePencil, QrCode, SignOut, Users } from "@phosphor-icons/react";

import { apiClient } from "@/lib/api";
import { setAccessToken } from "@/lib/tokenStore";

const LINKS = [
  { href: "/dashboard", label: "Registre", icon: ClipboardText },
  { href: "/dashboard/formulaire", label: "Formulaire", icon: NotePencil },
  { href: "/dashboard/qr-code", label: "QR Code", icon: QrCode },
  { href: "/dashboard/equipe", label: "Équipe", icon: Users, bossOnly: true },
];

export default function Sidebar({ orgName, role }: { orgName: string; role: "BOSS" | "STAFF" }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await apiClient.post("/auth/logout/").catch(() => {});
    setAccessToken(null);
    router.push("/");
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-surface p-6 md:flex">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-ink-soft">Établissement</p>
        <p className="font-heading font-semibold text-ink">{orgName}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {LINKS.filter((link) => !link.bossOnly || role === "BOSS").map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-cta text-white" : "text-ink-soft hover:bg-canvas"
              }`}
            >
              <Icon size={18} weight="bold" /> {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-canvas"
      >
        <SignOut size={18} weight="bold" /> Déconnexion
      </button>
    </aside>
  );
}
