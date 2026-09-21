"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import LegalLayout from "@/components/marketing/LegalLayout";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const JOURNEY = [
  { number: "01", title: "Créer l’espace", body: "Connecte-toi avec Google, choisis Patron, puis renseigne le nom et le logo de ton établissement." },
  { number: "02", title: "Préparer le parcours", body: "Repars d’un modèle de formulaire, ajuste les champs, puis crée autant de QR et points d’accueil que nécessaire." },
  { number: "03", title: "Accueillir", body: "Le visiteur scanne, remplit et signe sans compte. La tablette continue de fonctionner même sans réseau." },
  { number: "04", title: "Piloter", body: "Le registre, les statistiques Recharts, les exports et la gestion d’équipe restent disponibles depuis le dashboard." },
];

export default function AidePage() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".help-hero > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" });
    gsap.from(".help-step", { scrollTrigger: { trigger: ".help-journey", start: "top 78%" }, y: 35, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power3.out" });
    gsap.from(".help-block", { scrollTrigger: { trigger: ".help-block", start: "top 84%" }, x: -24, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power2.out" });
  }, { scope: root });

  return <div ref={root}><LegalLayout title="Aide"><div className="help-hero mb-14 rounded-[1.5rem] bg-mk-deep p-7 text-deep-ink sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mk-sage">Le parcours R3NS3IGN3M3NT</p><h2 className="mt-4 max-w-2xl text-3xl font-bold leading-[0.98] tracking-[-0.03em] text-deep-ink sm:text-5xl">Du premier QR à une arrivée maîtrisée.</h2><p className="mt-5 max-w-xl text-sm font-bold leading-relaxed text-mk-sage">Une aide courte, pensée pour comprendre quoi faire dans le bon ordre — Patron, Gérant, Staff ou visiteur.</p></div>
      <section className="help-journey mb-16 grid gap-3 sm:grid-cols-2"><h2 className="sr-only">Les quatre étapes</h2>{JOURNEY.map((step) => <article key={step.number} className="help-step rounded-2xl border border-mk-ink/10 bg-mk-stone p-6"><span className="text-xs font-bold text-mk-moss">{step.number}</span><h3 className="mt-8 text-xl font-bold">{step.title}</h3><p className="mt-2 text-sm font-bold leading-relaxed text-mk-ink/70">{step.body}</p></article>)}</section>
      <div className="space-y-12"><section className="help-block"><h2>Pour le Patron</h2><h3>Comment créer mon espace ?</h3><p>Clique sur « Se connecter » et utilise ton compte Google. L’onboarding te guide pour choisir ton rôle, renseigner l’établissement, configurer le formulaire et afficher le QR.</p><h3>Comment configurer l’établissement ?</h3><p>Ajoute le nom et le logo grâce au dépôt Cloudinary, puis définis les motifs de visite. Le logo apparaît dans l’interface, le formulaire public et au centre du QR.</p><h3>Comment gérer mon équipe ?</h3><p>Invite un Gérant ou un membre Staff par email. La personne doit se connecter avec le compte Google invité pour être rattachée à l’établissement.</p><h3>À quoi sert le Mode staff ?</h3><p>Le Patron ou le Gérant peut ouvrir Dashboard → Mode staff lorsqu’aucun agent n’est disponible. Le QR s’affiche en grand et un bouton ouvre directement le formulaire pour une tablette d’accueil.</p><h3>Comment lire les statistiques ?</h3><p>Dashboard → Registre affiche le volume total, le volume du jour, l’heure de pointe, la courbe horaire Recharts et les motifs fréquents. Le registre et les statistiques s’actualisent automatiquement toutes les 30 secondes.</p><h3>Comment récupérer mes données ?</h3><p>Dashboard → Registre → Exporter en CSV.</p></section>
        <section className="help-block"><h2>Pour le Gérant et le Staff</h2><p>Le Gérant peut gérer les opérations autorisées, tandis que le Staff consulte le registre et utilise l’accueil. Les actions sensibles, comme renommer l’établissement, changer le logo, inviter des membres ou régénérer le QR, restent réservées au Patron.</p></section>
        <section className="help-block"><h2>Pour le visiteur</h2><h3>Dois-je créer un compte ?</h3><p>Non. Scanne le QR ou utilise la tablette d’accueil : aucun compte visiteur n’est nécessaire.</p><h3>Et si je n’ai pas de réseau ou de téléphone ?</h3><p>L’établissement peut fournir une tablette. Le formulaire peut conserver les données localement et les synchroniser lorsque l’appareil retrouve Internet.</p><h3>Que devient ma signature ?</h3><p>Elle est enregistrée avec la fiche lorsque le formulaire la demande et reste accessible uniquement aux membres autorisés de l’établissement.</p></section></div><div className="legal-warning">Une question qui ne trouve pas de réponse ici ? <strong>Écris à l’équipe AKATech Studio depuis le widget Feedback.</strong></div>
    </LegalLayout></div>;
}
