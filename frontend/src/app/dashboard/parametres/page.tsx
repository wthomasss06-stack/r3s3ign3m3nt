"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import type { UserProfile } from "@/types";

export default function ParametresIndexPage() {
  const router = useRouter();

  useEffect(() => {
    apiClient.get<UserProfile>("/auth/me/").then((res) => {
      const target = res.data.role === "STAFF" ? "/dashboard/parametres/qr-code" : "/dashboard/parametres/formulaire";
      router.replace(target);
    });
  }, [router]);

  return <Loader fullScreen={false} />;
}
