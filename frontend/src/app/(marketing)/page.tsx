"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { ArrowDownRight, ArrowUpRight, CheckMark } from "@/components/icons";
import Logo from "@/components/Logo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FEATURES = [
  {
    n: "01",
    title: "Aucune connexion pour le visiteur",
    body: "Il scanne le QR affiché à l'accueil, remplit le formulaire, signe du doigt. Aucun compte, aucune donnée mobile à lui demander.",
    image: "/landing-images/kiosque-wide.webp",
  },
  {
    n: "02",
    title: "Hors-ligne, vraiment",
    body: "La tablette d'accueil continue d'enregistrer même sans réseau pendant plusieurs jours. Tout part vers le dashboard dès que la connexion revient.",
    image: "/landing-images/offline.webp",
  },
  {
    n: "03",
    title: "Un formulaire par métier",
    body: "Bureau, restaurant, hôtel, accès chantier — un modèle de départ pour chaque secteur, entièrement modifiable ensuite.",
    image: "/landing-images/secteurs.webp",
  },
  {
    n: "04",
    title: "Un dashboard qui s'adapte",
    body: "Le tableau de bord affiche automatiquement les champs choisis. Export CSV et régénération du QR en un clic.",
    image: "/landing-images/dashboard.webp",
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
  const [answers, setAnswers] = useState({ sector: "", volume: "", priority: "" });

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".hero-kicker", { opacity: 0, x: -20, duration: 0.6 })
      .from(".hero-h1", { y: 40, opacity: 0, duration: 0.9 }, "-=0.3")
      .from(".hero-lead", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
      .from(".hero-actions", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".hero-visual", { scale: 0.92, opacity: 0, duration: 1 }, "-=0.7");

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

    gsap.from(".questionnaire-card", {
      scrollTrigger: { trigger: ".questionnaire", start: "top 78%" },
      y: 36,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, { scope: heroRef });

  return (
    <div ref={heroRef}>
      {/* Hero */}
      <section className="relative grid min-h-[100svh] items-center gap-12 overflow-hidden px-5 pb-16 pt-28 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
        <div>
          <div className="hero-kicker flex items-center gap-2.5 font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-ink">
            <span className="h-px w-7 bg-current" /> Registre d&apos;accueil sans papier
          </div>
          <h1 className="hero-h1 mt-6 max-w-full break-all text-[clamp(2.45rem,9vw,7rem)] font-bold leading-[0.9] tracking-[-0.07em]">
            R3NS3IGN3M3NT
          </h1>
          <p className="hero-lead mt-6 max-w-md text-[1.05rem] leading-relaxed text-mk-ink/70">
            R3NS3IGN3M3NT remplace le registre papier des bureaux, restaurants, hôtels et accès chantier — par un
            QR Code que le visiteur scanne sans jamais créer de compte.
          </p>
          <div className="hero-actions mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/connexion"
              className="inline-flex items-center gap-3 rounded-full bg-cta px-6 py-4 text-xs font-bold uppercase tracking-[0.05em] text-cta-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-[0_10px_20px_rgba(23,52,38,0.15)]"
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
          <div className="overflow-hidden rounded-[1.4rem] shadow-[0_30px_70px_rgba(23,52,38,0.18)]">
            <Image
              src="/landing-images/hero.webp"
              alt="Formulaire R3NS3IGN3M3NT sur tablette, badge visiteur avec QR Code"
              width={1200}
              height={1200}
              className="h-auto w-full"
              priority
            />
          </div>
          <div className="mt-4 flex justify-between px-2 font-mk-mono text-[10px] uppercase tracking-[0.08em] text-mk-ink">
            <span>Une prise en main immédiate.</span>
            <span>Un accueil qui reste fluide.</span>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="manifesto grid gap-12 bg-mk-deep px-5 py-24 text-deep-ink sm:px-10 lg:grid-cols-[1fr_3fr] lg:py-36">
        <div className="flex items-start justify-between font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-sage lg:flex-col lg:gap-4">
          <span>D&apos;où ça vient</span>
        </div>
        <div>
          <p className="big-statement max-w-3xl text-[2.4rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.2rem]">
            Un cahier à 1000 FCFA reste imbattable sur le terrain. <em className="font-mk-serif font-bold not-italic text-mk-lime italic">Jusqu&apos;à ce qu&apos;il faille relire l&apos;écriture de quelqu&apos;un.</em>
          </p>
          <div className="mt-16 max-w-sm border-t border-deep-ink/15 pt-6">
            <p className="text-sm leading-relaxed text-mk-sage">
              Le papier ne tombe jamais en panne, ne demande pas de réseau. Mais il se perd, s&apos;abîme, et
              personne ne peut le consulter à distance. R3NS3IGN3M3NT garde la simplicité du cahier et ajoute
              ce qu&apos;il ne pourra jamais faire.
            </p>
            <div className="mt-8 flex items-center gap-4 font-mk-mono text-[10px] leading-relaxed text-mk-sage">
              <Logo size={40} className="rounded-full border border-mk-sage/40 bg-deep-ink/5 p-1.5" />
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
            Le strict nécessaire, <em className="font-mk-serif italic font-bold text-mk-moss">rien à installer.</em>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.n} className="feature-card overflow-hidden rounded-[1.4rem] border border-mk-ink/10 bg-white/40">
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.title}
                  width={640}
                  height={480}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <span className="font-mk-mono text-xs text-mk-moss">{f.n}</span>
                <h3 className="mt-4 text-xl font-bold tracking-[-0.01em]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mk-ink/70">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Méthode / Comment ça marche */}
      {/* Sécurité & rôles */}
      <section className="px-5 py-20 sm:px-10 lg:py-28">
        <div className="overflow-hidden rounded-[1.4rem]">
          <Image
            src="/landing-images/securite-wide.webp"
            alt="Rôles Patron et Agent d'accueil, données protégées"
            width={2000}
            height={860}
            className="h-auto w-full"
          />
        </div>
      </section>

      <section id="comment-ca-marche" className="grid gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[1fr_1.4fr] lg:py-36">
        <div>
          <div className="flex items-center gap-2.5 font-mk-mono text-[10px] uppercase tracking-[0.12em] text-mk-ink">
            <span className="h-px w-7 bg-current" /> Le parcours
          </div>
          <h2 className="mt-6 text-[2.6rem] leading-[0.95] tracking-[-0.03em] sm:text-[3.5rem]">
            Du scan <br />
            <em className="font-mk-serif italic font-bold text-mk-moss">au dashboard.</em>
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
          <span>R3NS3IGN3M3NT / 2026</span>
        </div>
        <p className="mt-10 max-w-3xl text-2xl font-bold leading-snug tracking-[-0.02em] sm:text-4xl">
          Une bonne expérience d&apos;accueil <em className="font-mk-serif italic font-bold text-mk-moss">se remarque quand elle ne pose aucun problème.</em>
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

      {/* Questionnaire de qualification */}
      <section className="questionnaire px-5 py-20 sm:px-10 lg:py-28">
        <div className="questionnaire-card mx-auto max-w-5xl rounded-[1.6rem] border border-mk-ink/10 bg-mk-stone p-7 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div><div className="flex items-center gap-2.5 font-mk-mono text-[10px] font-bold uppercase tracking-[0.12em] text-mk-ink"><span className="h-px w-7 bg-current" /> En 30 secondes</div><h2 className="mt-5 text-3xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-4xl">Quel accueil veux-tu simplifier ?</h2><p className="mt-4 text-sm leading-relaxed text-mk-ink/70">Réponds à trois questions. On te montrera le parcours le plus adapté avant la création de ton espace.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[{ key: "sector", label: "Ton activité", options: ["Bureau", "Restaurant", "Hôtel", "Chantier"] }, { key: "volume", label: "Visiteurs par jour", options: ["Moins de 20", "20 à 100", "Plus de 100"] }, { key: "priority", label: "Ta priorité", options: ["Éviter le papier", "Rester opérationnel hors-ligne", "Mieux suivre les arrivées"] }].map((question) => <label key={question.key} className="text-xs font-bold text-mk-ink">{question.label}<select value={answers[question.key as keyof typeof answers]} onChange={(event) => setAnswers((current) => ({ ...current, [question.key]: event.target.value }))} className="mt-2 w-full rounded-xl border border-mk-ink/10 bg-mk-paper px-3 py-3 text-sm font-bold text-mk-ink outline-none focus:border-mk-ink"><option value="">Choisir</option>{question.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}
              <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-4 border-t border-mk-ink/10 pt-5"><p className="max-w-md text-sm font-bold text-mk-ink">{answers.sector && answers.volume && answers.priority ? `Pour un ${answers.sector.toLowerCase()} avec ${answers.volume.toLowerCase()}, commence par un QR et un formulaire ${answers.priority.toLowerCase()}.` : "Choisis tes réponses pour recevoir une recommandation simple."}</p><Link href="/connexion" className="inline-flex items-center gap-3 rounded-full bg-cta px-6 py-3.5 text-xs font-bold uppercase tracking-[0.05em] text-cta-ink transition hover:-translate-y-0.5 hover:bg-cta-hover">Créer mon espace <ArrowUpRight /></Link></div>
            </div>
          </div>
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
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-cta px-7 py-4 text-xs font-bold uppercase tracking-[0.05em] text-cta-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-cta-hover"
          >
            Se connecter <ArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
