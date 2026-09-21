import type { Metadata, Viewport } from "next";
import { Chelsea_Market } from "next/font/google";

import Providers from "@/components/Providers";
import { THEME_INIT_SCRIPT } from "@/hooks/useTheme";
import "./globals.css";

// Police unique du site appliquée partout : Chelsea Market.
const sans = Chelsea_Market({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://akatech.vercel.app"),
  title: { default: "R3NS3IGN3M3NT — le registre digital", template: "%s — R3NS3IGN3M3NT" },
  description: "R3NS3IGN3M3NT remplace le registre papier par un QR Code et une tablette d’accueil, sans compte visiteur et même hors-ligne.",
  keywords: ["registre visiteurs", "QR Code accueil", "registre digital", "tablette accueil", "visiteurs sans compte", "R3NS3IGN3M3NT", "Abidjan"],
  applicationName: "R3NS3IGN3M3NT",
  authors: [{ name: "AKATech Studio", url: "https://akatech.vercel.app/" }],
  openGraph: { type: "website", locale: "fr_FR", siteName: "R3NS3IGN3M3NT", title: "R3NS3IGN3M3NT — le registre digital", description: "Un QR Code pour accueillir les visiteurs sans compte, même hors-ligne.", url: "https://akatech.vercel.app/", images: [{ url: "/landing-images/hero.webp", width: 1200, height: 1200, alt: "R3NS3IGN3M3NT sur tablette" }] },
  twitter: { card: "summary_large_image", title: "R3NS3IGN3M3NT — le registre digital", description: "Un QR Code pour accueillir les visiteurs sans compte.", images: ["/landing-images/hero.webp"] },
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
