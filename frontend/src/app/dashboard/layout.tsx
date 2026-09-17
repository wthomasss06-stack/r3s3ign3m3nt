"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Loader from "@/components/Loader";
import MobileNav from "@/components/dashboard/MobileNav";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSilentSession } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import type { UserProfile } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith("/dashboard/onboarding");
  const { loading: sessionLoading, isAuthenticated } = useSilentSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    apiClient
      .get<UserProfile>("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => setError("Impossible de charger ton profil. Vérifie ta connexion."));
  }, [sessionLoading, isAuthenticated, router]);

  if (sessionLoading || (isAuthenticated && !user && !error)) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-ink-soft">{error}</p>
        <button
          onClick={() => location.reload()}
          className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-white transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!user) return null; // redirection déjà déclenchée vers "/"

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar orgName={user.organization_name} role={user.role} />
      <main className="dashboard-main">
        <div className="dashboard-content">{children}</div>
      </main>
      <MobileNav role={user.role} />
    </div>
  );
}
