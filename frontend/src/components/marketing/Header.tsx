"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { ArrowUpRight, CloseIcon, MenuIcon } from "@/components/icons";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

gsap.registerPlugin(useGSAP);

const NAV_LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/aide", label: "Aide" },
];

export default function Header() {
  const navRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const scrollingDown = y > lastY && y > 80;
      setHidden(scrollingDown && !menuOpen);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useGSAP(
    () => {
      gsap.from(navRef.current, { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" });
    },
    { scope: navRef }
  );

  return (
    <header
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-30 flex h-[72px] items-center justify-between bg-transparent px-5 transition-transform duration-300 sm:px-10 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5 font-mk-sans font-extrabold tracking-[-0.04em] text-mk-ink">
        <Logo size={30} />
        <span className="text-[15px]">
          R3S3IGN3M3NT <em className="font-mk-serif text-[14px] font-normal not-italic sm:italic">registre digital</em>
        </span>
      </Link>

      <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.06em] md:flex" aria-label="Navigation principale">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="opacity-75 transition-opacity hover:opacity-100">
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 rounded-full bg-mk-deep px-[18px] py-3 text-cta-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-mk-moss"
        >
          Se connecter <ArrowUpRight size={14} />
        </Link>
      </nav>

      <div className="flex items-center gap-3 md:hidden">
        <ThemeToggle />
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="text-mk-ink"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute inset-x-0 top-[72px] flex flex-col gap-5 border-b border-mk-ink/10 bg-mk-paper p-6 text-sm font-bold uppercase tracking-wide md:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/connexion"
            onClick={() => setMenuOpen(false)}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-mk-deep px-[18px] py-3 text-cta-ink"
          >
            Se connecter <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </header>
  );
}
