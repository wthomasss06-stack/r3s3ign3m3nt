"use client";
import Link from "next/link";

import { ArrowUp } from "@/components/icons";
import Logo from "@/components/Logo";
import PwaInstallButton from "./PwaInstallButton";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Produit",
    links: [
      ["Fonctionnalités", "/#fonctionnalites"],
      ["Comment ça marche", "/#comment-ca-marche"],
      ["Se connecter", "/connexion"],
    ],
  },
  {
    title: "Ressources",
    links: [
      ["Aide", "/aide"],
      ["CGU", "/cgu"],
      ["Confidentialité", "/confidentialite"],
      ["Mentions légales", "/mentions-legales"],
    ],
  },
];

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-mk-ink/10 bg-mk-paper pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-16">
      <div className="app-shell-wide grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-12">
        <div>
          <Logo size={64} href="/" />
          <p className="mt-4 max-w-[220px] text-sm leading-relaxed text-mk-moss">
            Le registre d&apos;accueil qui remplace le cahier — sans compte pour le visiteur, même hors-ligne.
          </p>
          <PwaInstallButton />
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-moss">{column.title}</h3>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-mk-ink" aria-label={column.title}>
              {column.links.map(([label, href]) => (
                <Link key={href} href={href} className="w-fit opacity-80 transition-opacity hover:opacity-100">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="app-shell-wide mt-12 flex flex-col items-start justify-between gap-4 border-t border-mk-ink/10 pt-6 font-mk-mono text-[10px] uppercase tracking-[0.08em] text-mk-moss sm:mt-16 sm:flex-row sm:items-center">
        <span>© 2026 R3S3IGN3M3NT</span>
        <a
          href="https://akatech.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="opacity-80 transition-opacity hover:opacity-100"
        >
          Conçu par AKATech Studio
        </a>
        <button onClick={scrollTop} className="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100">
          Retour en haut <ArrowUp size={13} />
        </button>
      </div>
    </footer>
  );
}
