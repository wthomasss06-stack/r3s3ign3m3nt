"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardText, Gear, QrCode, SignOut, Users } from "@phosphor-icons/react";

import Logo from "@/components/Logo";
import { apiClient } from "@/lib/api";
import { setAccessToken } from "@/lib/tokenStore";

const LINKS = [
  { href: "/dashboard", label: "Registre", icon: ClipboardText },
  { href: "/dashboard/qr-code", label: "QR Code", icon: QrCode, allowed: ["BOSS", "GERANT"] },
  { href: "/dashboard/equipe", label: "Équipe", icon: Users, allowed: ["BOSS"] },
  { href: "/dashboard/parametres", label: "Paramètres", icon: Gear, allowed: ["BOSS", "GERANT"] },
];

export default function Sidebar({ orgName, role }: { orgName: string; role: "BOSS" | "GERANT" | "STAFF" }) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleLinks = LINKS.filter((link) =>
    link.allowed ? link.allowed.includes(role) : role !== "STAFF"
  );

  const logout = async () => {
    await apiClient.post("/auth/logout/").catch(() => {});
    setAccessToken(null);
    router.push("/");
  };

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface p-5 md:flex lg:w-64 lg:p-6">
      <div className="mb-6">
        <Logo size={52} back />
        <p className="mt-4 text-xs uppercase tracking-wide text-ink-soft">Établissement</p>
        <p className="font-heading font-semibold text-ink">{orgName}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {visibleLinks.map(({ href, label, icon: Icon }) => {
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
