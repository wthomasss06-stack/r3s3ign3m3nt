"use client";
import { useEffect, useState } from "react";

import { DownloadIcon } from "@/components/icons";

// L'API beforeinstallprompt n'est pas standardisée dans lib.dom.d.ts.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * N'apparaît QUE quand le navigateur a réellement determiné que l'app est
 * installable (Chrome/Edge/Android — pas de support beforeinstallprompt sur
 * iOS/Safari, comportement standard de la plateforme, pas un bug). Disparaît
 * une fois l'app installée.
 */
export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !deferredPrompt) return null;

  const install = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <button
      onClick={install}
      className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-cta px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.05em] text-cta-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-cta-hover"
    >
      Installer l&apos;application
      <DownloadIcon size={14} />
    </button>
  );
}
