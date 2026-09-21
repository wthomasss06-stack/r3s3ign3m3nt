"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardText, GearSix, SignOut, UserCircle } from "@phosphor-icons/react";
import ThemeToggle from "@/components/ThemeToggle";
import { apiClient } from "@/lib/api";
import { setAccessToken } from "@/lib/tokenStore";

const LINKS = [{ href: "/dashboard", label: "Registre", icon: ClipboardText, exact: true }, { href: "/dashboard/parametres", label: "Paramètres", icon: GearSix, exact: false }];
export default function Sidebar({ orgName, orgLogo = "", userName = "", userAvatar = "" }: { orgName: string; orgLogo?: string; userName?: string; userAvatar?: string }) {
  const pathname = usePathname(); const router = useRouter();
  const active = (href: string, exact: boolean) => exact ? pathname === href : pathname.startsWith(href);
  const logout = async () => { await apiClient.post("/auth/logout/").catch(() => {}); setAccessToken(null); router.push("/"); };
  const Brand = () => orgLogo ? <img src={orgLogo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-contain" /> : <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cta text-xs font-bold text-white">{orgName.slice(0, 2).toUpperCase()}</div>;
  const Profile = () => <Link href="/dashboard/parametres" className="flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2 hover:bg-canvas"><div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-canvas">{userAvatar ? <img src={userAvatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <UserCircle size={32} className="text-ink-soft" />}</div><div className="min-w-0 whitespace-nowrap"><p className="truncate text-sm font-medium text-ink">{userName || "Mon profil"}</p><p className="text-[11px] text-ink-soft">Profil & rôle</p></div></Link>;
  return <>
    <aside className="group fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 hover:w-64 md:flex"><div className="flex items-center gap-3 border-b border-border p-4"><Brand /><div className="min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100"><p className="text-[10px] uppercase tracking-wide text-ink-soft">Établissement</p><p className="truncate font-heading text-sm font-semibold text-ink">{orgName}</p></div></div><nav className="flex-1 space-y-1 p-3">{LINKS.map(({ href, label, icon: Icon, exact }) => <Link key={href} href={href} className={`flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium ${active(href, exact) ? "bg-cta text-white" : "text-ink-soft hover:bg-canvas"}`}><Icon size={18} weight="bold" className="shrink-0" /><span className="whitespace-nowrap opacity-0 group-hover:opacity-100">{label}</span></Link>)}</nav><div className="space-y-1 border-t border-border p-3"><Profile /><div className="px-3 py-1"><ThemeToggle /></div><button onClick={logout} className="flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas"><SignOut size={18} weight="bold" className="shrink-0" /><span className="whitespace-nowrap opacity-0 group-hover:opacity-100">Déconnexion</span></button></div></aside>
    <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden"><div className="flex min-w-0 items-center gap-2"><Brand /><p className="truncate font-heading text-sm font-semibold text-ink">{orgName}</p></div><div className="flex items-center gap-2"><Profile /><ThemeToggle /><button onClick={logout} aria-label="Déconnexion" className="p-2 text-ink-soft"><SignOut size={20} weight="bold" /></button></div></div>
    <nav className="fixed inset-x-4 bottom-4 z-20 flex justify-between rounded-full bg-cta px-2 py-2 shadow-xl md:hidden">{LINKS.map(({ href, label, icon: Icon, exact }) => <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 rounded-full py-2 text-[11px] font-medium ${active(href, exact) ? "text-white" : "text-white/50"}`}><Icon size={20} weight="bold" />{label}</Link>)}</nav>
  </>;
}
