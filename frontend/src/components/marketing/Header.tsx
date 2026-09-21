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
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const scrollingDown = y > lastY && y > 80;
      setHidden(footerVisible || (scrollingDown && !menuOpen));
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [footerVisible, menuOpen]);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>("[data-footer-zone]");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(Boolean(entry?.isIntersecting)), { threshold: 0.12 });
    observer.observe(footer);
    return () => observer.disconnect();
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
      className={`fixed inset-x-0 top-0 z-30 flex h-[84px] items-center justify-between bg-transparent px-5 transition-transform duration-300 sm:px-10 ${
        hidden || footerVisible ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link href="/" className="flex items-center">
        <Logo size={60} />
      </Link>

      <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.06em] md:flex" aria-label="Navigation principale">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-mk-moss transition-colors hover:text-mk-ink">{link.label}</Link>
        ))}
        <ThemeToggle />
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 rounded-full bg-cta px-[18px] py-3 text-cta-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-cta-hover"
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
        <div className="absolute inset-x-0 top-[84px] flex flex-col gap-5 border-b border-mk-ink/10 bg-mk-paper p-6 text-sm font-bold uppercase tracking-wide md:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/connexion"
            onClick={() => setMenuOpen(false)}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cta px-[18px] py-3 text-cta-ink"
          >
            Se connecter <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </header>
  );
}
