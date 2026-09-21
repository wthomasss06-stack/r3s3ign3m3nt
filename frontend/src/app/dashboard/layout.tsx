"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSilentSession } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import type { Organization, UserProfile } from "@/types";
import Modal from "@/components/ui/Modal";
import { readSessionCache, writeSessionCache } from "@/lib/sessionStore";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const { loading: sessionLoading, isAuthenticated } = useSilentSession();
  const cachedSession = readSessionCache();
  const [user, setUser] = useState<UserProfile | null>(cachedSession?.user || null); const [org, setOrg] = useState<Organization | null>(cachedSession?.organization || null); const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  useEffect(() => { if (sessionLoading) return; if (!isAuthenticated) { router.push("/"); return; } const raw = sessionStorage.getItem("qr_login_greeting"); if (raw) { try { const info = JSON.parse(raw); setGreeting(info.isNew ? `Bienvenue${info.name ? `, ${info.name}` : ""} !` : `Bon retour${info.name ? `, ${info.name}` : ""} !`); } catch {} sessionStorage.removeItem("qr_login_greeting"); } Promise.all([apiClient.get<UserProfile>("/auth/me/"), apiClient.get<Organization>("/org/me/")]).then(([me, organization]) => { setUser(me.data); setOrg(organization.data); writeSessionCache(me.data, organization.data); }).catch(() => { if (!cachedSession) setError("Impossible de charger ton profil. Vérifie ta connexion."); }); }, [sessionLoading, isAuthenticated, router]);
  if (sessionLoading || (isAuthenticated && !user && !error)) return <Loader />;
  if (error) return <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center"><p className="text-ink-soft">{error}</p><button onClick={() => location.reload()} className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-white">Réessayer</button></div>;
  if (!user) return null;
  const isLegacyOnboarding = pathname.startsWith("/dashboard/onboarding");
  return <div className="min-h-screen bg-canvas">{!isLegacyOnboarding && <Sidebar orgName={org?.name || user.organization_name} orgLogo={org?.logo_url} userName={user.full_name || user.email} userAvatar={user.avatar_url} role={user.role} />}<main className={isLegacyOnboarding ? "min-h-screen p-6 md:p-10" : "p-6 pb-28 md:ml-[72px] md:p-10 md:pb-10"}>{children}</main>{!isLegacyOnboarding && <Modal open={Boolean(greeting)} onClose={() => setGreeting(null)} title={greeting || "Bienvenue"} description="Ton espace est prêt. Tu peux commencer par consulter le registre ou ouvrir les paramètres."><div className="flex justify-end"><button onClick={() => setGreeting(null)} className="rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-white">Commencer</button></div></Modal>}</div>;
}
