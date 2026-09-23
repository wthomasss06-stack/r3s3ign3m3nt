import type { Metadata, Viewport } from "next";
import { Chelsea_Market } from "next/font/google";

import Providers from "@/components/Providers";
import { THEME_INIT_SCRIPT } from "@/hooks/useTheme";
import "./globals.css";

const SITE_URL = "https://renseignement.vercel.app";

// Police unique du site appliquée partout : Chelsea Market.
const sans = Chelsea_Market({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  title: { default: "R3NS3IGN3M3NT | Registre visiteurs numérique par QR Code", template: "%s — R3NS3IGN3M3NT" },
  description: "Remplacez le cahier d’accueil papier par un registre visiteurs numérique avec QR Code. Fonctionne hors ligne, sans compte ni application pour les visiteurs.",
  keywords: ["registre visiteurs numérique", "QR Code accueil", "registre digital", "tablette accueil", "visiteurs sans compte", "R3NS3IGN3M3NT", "Abidjan"],
  applicationName: "R3NS3IGN3M3NT",
  authors: [{ name: "AKATech Studio", url: SITE_URL }],
  openGraph: { type: "website", locale: "fr_FR", siteName: "R3NS3IGN3M3NT", title: "R3NS3IGN3M3NT | Registre visiteurs numérique par QR Code", description: "Un registre visiteurs numérique avec QR Code, sans compte pour les visiteurs et utilisable hors ligne.", url: SITE_URL, images: [{ url: "/landing-images/hero.webp", width: 1200, height: 1200, alt: "R3NS3IGN3M3NT sur tablette" }] },
  twitter: { card: "summary_large_image", title: "R3NS3IGN3M3NT | Registre visiteurs numérique", description: "Un QR Code pour accueillir les visiteurs sans compte, même hors ligne.", images: ["/landing-images/hero.webp"] },
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
    <html lang="fr" className={sans.variable}>
      <body>
        {/* Applique la classe .dark avant l'hydratation React : evite un flash du
            mauvais theme au chargement (lit localStorage puis prefers-color-scheme). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
