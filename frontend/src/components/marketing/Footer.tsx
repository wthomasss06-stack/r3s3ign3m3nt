"use client";
import Image from "next/image";
import Link from "next/link";

import { ArrowUp } from "@/components/icons";
import Logo from "@/components/Logo";
import PwaInstallButton from "./PwaInstallButton";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  { title: "Produit", links: [["Fonctionnalités", "/#fonctionnalites"], ["Comment ça marche", "/#comment-ca-marche"], ["Se connecter", "/connexion"]] },
  { title: "Ressources", links: [["Aide", "/aide"], ["CGU", "/cgu"], ["Confidentialité", "/confidentialite"], ["Mentions légales", "/mentions-legales"]] },
];

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return <footer className="border-t border-mk-ink/10 bg-mk-paper px-5 pb-8 pt-16 sm:px-10">
    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4">
      <div><Link href="/" className="flex items-center"><Logo size={68} /></Link><p className="mt-4 max-w-[220px] text-sm leading-relaxed text-mk-moss">Le registre d&apos;accueil qui remplace le cahier — sans compte pour le visiteur, même hors-ligne.</p><PwaInstallButton /></div>
      {COLUMNS.map((column) => <div key={column.title}><h3 className="font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-moss">{column.title}</h3><nav className="mt-4 flex flex-col gap-3 text-sm text-mk-ink" aria-label={column.title}>{column.links.map(([label, href]) => <Link key={href} href={href} className="w-fit text-mk-moss transition-colors hover:text-mk-ink">{label}</Link>)}</nav></div>)}
    </div>
    <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-mk-ink/10 pt-6 font-mk-mono text-[10px] uppercase tracking-[0.08em] text-mk-moss sm:flex-row sm:items-center">
      <span>© 2026 R3S3IGN3M3NT</span>
      <a href="https://akatech.vercel.app/" target="_blank" rel="noreferrer" className="group relative text-mk-moss transition-colors hover:text-mk-ink">
        <span className="underline decoration-mk-ink/20 underline-offset-4">Conçu par AKATech Studio</span>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-4 w-44 -translate-x-1/2 translate-y-2 rounded-xl border border-mk-ink/10 bg-mk-paper p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <Image src="/akatech-studio-logo.webp" alt="Logo AKATech Studio" width={176} height={72} className="h-auto w-full rounded-lg object-contain" />
        </span>
      </a>
      <button onClick={scrollTop} className="flex items-center gap-2 text-mk-moss transition-colors hover:text-mk-ink">Retour en haut <ArrowUp size={13} /></button>
    </div>
  </footer>;
}
