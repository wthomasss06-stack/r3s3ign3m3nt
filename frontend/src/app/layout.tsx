import type { Metadata, Viewport } from "next";

import Providers from "@/components/Providers";
import { THEME_INIT_SCRIPT } from "@/hooks/useTheme";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "R3S3IGN3M3NT — le registre digital", template: "%s — R3S3IGN3M3NT" },
  description: "Registre visiteurs digital sans contact, sans compte pour le visiteur.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#173426",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {/* Applique la classe .dark avant l'hydratation React : evite un flash du
            mauvais theme au chargement (lit localStorage puis prefers-color-scheme). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
