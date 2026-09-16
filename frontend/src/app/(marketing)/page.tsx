"use client";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { ArrowDownRight, ArrowUpRight, CheckMark } from "@/components/icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FEATURES = [
  {
    n: "01",
    title: "Aucune connexion pour le visiteur",
    body: "Il scanne le QR affiché à l'accueil, remplit le formulaire, signe du doigt. Aucun compte, aucune donnée mobile à lui demander.",
  },
  {
    n: "02",
    title: "Hors-ligne, vraiment",
    body: "La tablette d'accueil continue d'enregistrer même sans réseau pendant plusieurs jours. Tout part vers le dashboard dès que la connexion revient.",
  },
  {
    n: "03",
    title: "Un formulaire par métier",
    body: "Bureau, restaurant, hôtel, accès chantier — un modèle de départ pour chaque secteur, entièrement modifiable ensuite.",
  },
  {
    n: "04",
    title: "Un dashboard qui s'adapte",
    body: "Le tableau de bord affiche automatiquement les champs choisis. Export CSV et régénération du QR en un clic.",
  },
];

const STEPS = [
  { n: "01", title: "Scanner", body: "Le visiteur scanne le QR affiché à l'accueil, ou trouve le formulaire déjà ouvert sur la tablette dédiée." },
  { n: "02", title: "Remplir", body: "Nom, contact, motif — uniquement les champs que le patron a choisis pour son établissement." },
  { n: "03", title: "Signer", body: "Signature au doigt, comme dans une application de lecture PDF." },
  { n: "04", title: "Synchroniser", body: "Envoi automatique dès que l'appareil retrouve une connexion. Le patron voit tout depuis son dashboard." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".hero-kicker", { opacity: 0, x: -20, duration: 0.6 })
      .from(".hero-h1", { y: 40, opacity: 0, duration: 0.9 }, "-=0.3")
      .from(".hero-lead", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
      .from(".hero-actions", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".hero-visual", { scale: 0.92, opacity: 0, duration: 1 }, "-=0.7");

    gsap.to(".orbit-one", { rotation: 402, duration: 30, repeat: -1, ease: "none" });
    gsap.to(".orbit-two", { rotation: -400, duration: 35, repeat: -1, ease: "none" });

    gsap.from(".big-statement", {
      scrollTrigger: { trigger: ".manifesto", start: "top 75%" },
      y: 50,
      opacity: 0,
      duration: 1,
    });

    gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    });

    gsap.from(".method-steps li", {
      scrollTrigger: { trigger: ".method-steps", start: "top 80%" },
      x: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.18,
      ease: "power2.out",
    });

    gsap.from(".promise-item", {
      scrollTrigger: { trigger: ".promise-list", start: "top 80%" },
      y: 16,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
    });
  }, { scope: heroRef });

  return (
    <div ref={heroRef}>
      {/* Hero */}
      <section className="grid min-h-[720px] items-center gap-12 px-5 pb-20 pt-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:pt-24">
        <div>
          <div className="hero-kicker flex items-center gap-2.5 font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-ink">
            <span className="h-px w-7 bg-current" /> Registre d&apos;accueil sans papier
          </div>
          <h1 className="hero-h1 mt-6 max-w-xl text-[3.2rem] font-extrabold leading-[0.92] tracking-[-0.04em] sm:text-[4.5rem] lg:text-[5.2rem]">
            Le cahier <br />
            <span className="font-mk-serif italic font-semibold text-mk-moss">prend forme.</span>
          </h1>
          <p className="hero-lead mt-6 max-w-md text-[1.05rem] leading-relaxed text-mk-ink/70">
            R3S3IGN3M3NT remplace le registre papier des bureaux, restaurants, hôtels et accès chantier — par un
            QR Code que le visiteur scanne sans jamais créer de compte.
          </p>
          <div className="hero-actions mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/connexion"
              className="inline-flex items-center gap-3 rounded-full bg-mk-deep px-6 py-4 text-xs font-extrabold uppercase tracking-[0.05em] text-mk-paper transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(23,52,38,0.15)]"
            >
              Se connecter <ArrowUpRight />
            </Link>
            <Link
              href="/#comment-ca-marche"
              className="inline-flex items-center gap-2 text-xs font-bold underline decoration-1 underline-offset-[5px] transition-opacity hover:opacity-75"
            >
              Voir comment ça marche <ArrowDownRight />
            </Link>
          </div>
          <div className="mt-14 flex items-center gap-2 font-mk-mono text-[10px] text-mk-moss">
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-mk-moss" />
            Enregistre les visiteurs même sans réseau, des jours durant.
          </div>
        </div>

        <div className="hero-visual relative">
          <div className="flex justify-between font-mk-mono text-[10px] uppercase tracking-[0.08em] text-mk-moss">
            <span>Accueil / Kiosque</span>
            <span>Hors-ligne par défaut</span>
          </div>
          <div
            className="relative mx-auto my-5 grid aspect-square place-items-center overflow-hidden rounded-full"
            style={{ background: "linear-gradient(145deg, #627761, #294735)", boxShadow: "22px 35px 70px rgba(22,51,37,0.22)" }}
          >
            <div
              className="orbit-one absolute rounded-full border border-mk-paper/25"
              style={{ width: "82%", height: "38%", transform: "rotate(42deg)" }}
            />
            <div
              className="orbit-two absolute rounded-full border border-mk-paper/25"
              style={{ width: "30%", height: "88%", transform: "rotate(-40deg)" }}
            />
            <div className="grid h-[60%] w-[60%] place-items-center rounded-full border border-white/20 bg-[radial-gradient(circle,rgba(214,231,168,0.4)_0%,rgba(23,52,38,0.8)_100%)] [mix-blend-mode:screen]">
              <span className="font-mk-serif text-5xl italic text-mk-paper">R3</span>
            </div>
            <span className="absolute left-[13%] top-[16%] font-mk-mono text-[9px] uppercase tracking-[0.08em] text-mk-paper">
              R3S3IGN3M3NT
            </span>
            <span className="absolute bottom-[15%] right-[12%] text-right font-mk-mono text-[9px] uppercase tracking-[0.08em] text-mk-paper">
              Cahier → <strong className="font-normal text-mk-lime">QR Code</strong>
            </span>
          </div>
          <div className="flex justify-between px-2 font-mk-mono text-[10px] uppercase tracking-[0.08em] text-mk-ink">
            <span>Une forme reconnaissable.</span>
            <span>Un accueil qui reste fluide.</span>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="manifesto grid gap-12 bg-mk-deep px-5 py-24 text-mk-paper sm:px-10 lg:grid-cols-[1fr_3fr] lg:py-36">
        <div className="flex items-start justify-between font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-sage lg:flex-col lg:gap-4">
          <span>D&apos;où ça vient</span>
        </div>
        <div>
          <p className="big-statement max-w-3xl text-[2.4rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.2rem]">
            Un cahier à 1000 FCFA reste imbattable sur le terrain. <em className="font-mk-serif font-semibold not-italic text-mk-lime italic">Jusqu&apos;à ce qu&apos;il faille relire l&apos;écriture de quelqu&apos;un.</em>
          </p>
          <div className="mt-16 grid gap-10 border-t border-mk-paper/15 pt-6 sm:grid-cols-2">
            <p className="max-w-sm text-sm leading-relaxed text-mk-sage">
              Le papier ne tombe jamais en panne, ne demande pas de réseau. Mais il se perd, s&apos;abîme, et personne
              ne peut le consulter à distance. R3S3IGN3M3NT garde la simplicité du cahier et ajoute ce qu&apos;il ne
              pourra jamais faire.
            </p>
            <div className="flex items-center gap-4 font-mk-mono text-[10px] leading-relaxed text-mk-sage">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-mk-sage font-mk-serif text-base italic text-mk-paper">
                R3
              </span>
              <span>
                Conçu pour le terrain
                <br />à Abidjan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="px-5 py-24 sm:px-10 lg:py-36">
        <div className="mb-16 max-w-xl">
          <div className="flex items-center gap-2.5 font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-ink">
            <span className="h-px w-7 bg-current" /> Ce que ça change
          </div>
          <h2 className="mt-6 text-[2.6rem] leading-[0.95] tracking-[-0.03em] sm:text-[3.5rem]">
            Le strict nécessaire, <em className="font-mk-serif italic font-semibold text-mk-moss">rien à installer.</em>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.n} className="feature-card rounded-[1.4rem] border border-mk-ink/10 bg-white/40 p-8">
              <span className="font-mk-mono text-xs text-mk-moss">{f.n}</span>
              <h3 className="mt-4 text-xl font-bold tracking-[-0.01em]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mk-ink/70">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Méthode / Comment ça marche */}
      <section id="comment-ca-marche" className="grid gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[1fr_1.4fr] lg:py-36">
        <div>
          <div className="flex items-center gap-2.5 font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-ink">
            <span className="h-px w-7 bg-current" /> Le parcours
          </div>
          <h2 className="mt-6 text-[2.6rem] leading-[0.95] tracking-[-0.03em] sm:text-[3.5rem]">
            Du scan <br />
            <em className="font-mk-serif italic font-semibold text-mk-moss">au dashboard.</em>
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-mk-ink/70">
            Quatre étapes, pensées pour un accueil qui n&apos;a pas le temps d&apos;expliquer une application à
            chaque visiteur.
          </p>
        </div>
        <ol className="method-steps flex flex-col gap-8">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-6 border-t border-mk-ink/10 pt-6 first:border-t-0 first:pt-0">
              <span className="font-mk-mono text-sm text-mk-moss">{step.n}</span>
              <div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-mk-ink/70">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Promesses */}
      <section className="border-t border-mk-ink/10 px-5 py-20 sm:px-10">
        <div className="flex justify-between font-mk-mono text-[10px] uppercase tracking-[0.08em] text-mk-moss">
          <span>Pensé pour le terrain</span>
          <span>R3S3IGN3M3NT / 2026</span>
        </div>
        <p className="mt-10 max-w-3xl text-2xl font-semibold leading-snug tracking-[-0.02em] sm:text-4xl">
          Une bonne expérience d&apos;accueil <em className="font-mk-serif italic font-semibold text-mk-moss">se remarque quand elle ne pose aucun problème.</em>
        </p>
        <div className="promise-list mt-10 grid gap-4 sm:grid-cols-2">
          {[
            "Zéro compte, zéro friction pour le visiteur",
            "Hors-ligne par défaut, pas en option",
            "Un formulaire adapté à chaque secteur",
            "Export CSV et QR régénérable à tout moment",
          ].map((item) => (
            <div key={item} className="promise-item flex items-center gap-3 text-sm text-mk-ink">
              <CheckMark size={16} />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 py-24 sm:px-10 lg:py-32">
        <div className="rounded-[1.4rem] bg-mk-stone px-8 py-16 text-center sm:px-16">
          <h2 className="mx-auto max-w-lg text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            Prêt à ranger le cahier ?
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm text-mk-ink/70">
            Connecte-toi avec Google — ton espace, ton QR et ton premier formulaire sont prêts en quelques secondes.
          </p>
          <Link
            href="/connexion"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-mk-deep px-7 py-4 text-xs font-extrabold uppercase tracking-[0.05em] text-mk-paper transition-all duration-200 hover:-translate-y-0.5"
          >
            Se connecter <ArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
