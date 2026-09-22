"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Loader from "@/components/Loader";
import Sidebar from "@/components/dashboard/Sidebar";
import Modal from "@/components/ui/Modal";
import { useAuthContext } from "@/context/AuthContext";
import SyncStatusBadge from "@/components/SyncStatusBadge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, user, organization, isAuthenticated } = useAuthContext();
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    const raw = sessionStorage.getItem("qr_login_greeting");
    if (!raw) return;
    try {
      const info = JSON.parse(raw) as { isNew?: boolean; name?: string };
      setGreeting(info.isNew ? `Bienvenue${info.name ? `, ${info.name}` : ""} !` : `Bon retour${info.name ? `, ${info.name}` : ""} !`);
    } catch {
      // Une donnée de session corrompue ne doit pas bloquer l’espace.
    }
    sessionStorage.removeItem("qr_login_greeting");
  }, [loading, isAuthenticated, router]);

  if (loading && !user) return <Loader />;
  if (!user) return null;

  const isLegacyOnboarding = pathname.startsWith("/dashboard/onboarding");
  return (
    <div className="min-h-screen bg-canvas">
      {!isLegacyOnboarding && <Sidebar orgName={organization?.name || user.organization_name} orgLogo={organization?.logo_url} userName={user.full_name || user.email} role={user.role} />}
      <main className={isLegacyOnboarding ? "min-h-screen p-6 md:p-10" : "p-6 pb-28 md:ml-[72px] md:p-10 md:pb-10"}>
        {!isLegacyOnboarding && <div className="mb-5 flex justify-end"><SyncStatusBadge /></div>}
        {children}
      </main>
      {!isLegacyOnboarding && <Modal open={Boolean(greeting)} onClose={() => setGreeting(null)} title={greeting || "Bienvenue"} description="Ton espace est prêt. Tu peux commencer par consulter le registre ou ouvrir les paramètres."><div className="flex justify-end"><button onClick={() => setGreeting(null)} className="rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-white">Commencer</button></div></Modal>}
    </div>
  );
}
