import type { Metadata, Viewport } from "next";
import { Chelsea_Market, Instrument_Serif } from "next/font/google";

import Providers from "@/components/Providers";
import "./globals.css";

// Police unique du site appliquée partout : Chelsea Market pour le texte UI et
// Instrument Serif pour les titres. Cela unifie visuellement tout le projet.
const sans = Chelsea_Market({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

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
    <html lang="fr" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
