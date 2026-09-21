"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSilentSession } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import type { Organization, UserProfile } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const { loading: sessionLoading, isAuthenticated } = useSilentSession();
  const [user, setUser] = useState<UserProfile | null>(null); const [org, setOrg] = useState<Organization | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (sessionLoading) return; if (!isAuthenticated) { router.push("/"); return; } Promise.all([apiClient.get<UserProfile>("/auth/me/"), apiClient.get<Organization>("/org/me/")]).then(([me, organization]) => { setUser(me.data); setOrg(organization.data); }).catch(() => setError("Impossible de charger ton profil. Vérifie ta connexion.")); }, [sessionLoading, isAuthenticated, router]);
  if (sessionLoading || (isAuthenticated && !user && !error)) return <Loader />;
  if (error) return <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center"><p className="text-ink-soft">{error}</p><button onClick={() => location.reload()} className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-white">Réessayer</button></div>;
  if (!user) return null;
  return <div className="min-h-screen bg-canvas"><Sidebar orgName={org?.name || user.organization_name} orgLogo={org?.logo_url} userName={user.full_name || user.email} userAvatar={user.avatar_url} /><main className="p-6 pb-28 md:ml-[72px] md:p-10 md:pb-10">{children}</main></div>;
}
