"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardText, GearSix, SignOut } from "@phosphor-icons/react";

import ThemeToggle from "@/components/ThemeToggle";
import { apiClient } from "@/lib/api";
import { setAccessToken } from "@/lib/tokenStore";

const LINKS = [
  { href: "/dashboard", label: "Registre", icon: ClipboardText, exact: true },
  { href: "/dashboard/parametres", label: "Paramètres", icon: GearSix, exact: false },
];

export default function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const logout = async () => {
    await apiClient.post("/auth/logout/").catch(() => {});
    setAccessToken(null);
    router.push("/");
  };

  return (
    <>
      {/* Desktop : rail replié (icônes) en position fixe, se déplie au survol sans
          faire bouger le contenu principal (overlay, pas de reflow). */}
      <aside className="group fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 hover:w-64 md:flex">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cta text-xs font-bold text-cta-ink">
            {orgName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="text-[10px] uppercase tracking-wide text-ink-soft">Établissement</p>
            <p className="truncate font-heading text-sm font-semibold text-ink">{orgName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {LINKS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(href, exact) ? "bg-cta text-cta-ink" : "text-ink-soft hover:bg-canvas"
              }`}
            >
              <Icon size={18} weight="bold" className="shrink-0" />
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <div className="flex items-center gap-3 overflow-hidden px-3 py-1">
            <ThemeToggle className="shrink-0" />
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-canvas"
          >
            <SignOut size={18} weight="bold" className="shrink-0" />
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Déconnexion
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile/tablette : bandeau haut + barre flottante basse (icônes) */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-soft">Établissement</p>
          <p className="font-heading text-sm font-semibold text-ink">{orgName}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={logout} aria-label="Déconnexion" className="p-2 text-ink-soft">
            <SignOut size={20} weight="bold" />
          </button>
        </div>
      </div>

      <nav
        className="fixed inset-x-4 bottom-4 z-20 flex justify-between rounded-full bg-cta px-2 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.25)] md:hidden"
        aria-label="Navigation"
      >
        {LINKS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 rounded-full py-2 text-[11px] font-medium transition ${
              isActive(href, exact) ? "text-cta-ink" : "text-cta-ink/50"
            }`}
          >
            <Icon size={20} weight="bold" /> {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
