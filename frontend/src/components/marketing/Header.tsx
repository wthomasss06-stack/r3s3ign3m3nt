"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { ArrowUpRight, CloseIcon, MenuIcon } from "@/components/icons";
import Logo from "@/components/Logo";

gsap.registerPlugin(useGSAP);

const NAV_LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/aide", label: "Aide" },
];

export default function Header() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      gsap.from(navRef.current, { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" });
    },
    { scope: navRef }
  );

  return (
    <header
      ref={navRef}
      className={`site-header ${
        scrolled ? "border-b border-mk-ink/10 bg-mk-paper/90 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="md:hidden">
        <Logo size={52} href="/" />
      </div>
      <div className="hidden md:block">
        <Logo size={64} href="/" />
      </div>

      <nav className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[0.06em] md:flex lg:gap-8" aria-label="Navigation principale">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="opacity-75 transition-opacity hover:opacity-100">
            {link.label}
          </Link>
        ))}
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 rounded-full bg-mk-deep px-[18px] py-3 text-mk-paper transition-all duration-200 hover:-translate-y-0.5 hover:bg-mk-moss"
        >
          Se connecter <ArrowUpRight size={14} />
        </Link>
      </nav>

      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="text-mk-ink md:hidden"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {menuOpen && (
        <div
          className="absolute inset-x-0 flex flex-col gap-5 border-b border-mk-ink/10 bg-mk-paper p-6 text-sm font-bold uppercase tracking-wide md:hidden"
          style={{ top: "calc(var(--header-h) + env(safe-area-inset-top, 0px))" }}
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/connexion"
            onClick={() => setMenuOpen(false)}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-mk-deep px-[18px] py-3 text-mk-paper"
          >
            Se connecter <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </header>
  );
}
