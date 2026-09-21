"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Camera, Check, Plus, X } from "@phosphor-icons/react";

import InviteStaff from "@/components/dashboard/InviteStaff";
import SimpleFormSetup from "@/components/onboarding/SimpleFormSetup";
import QRCodeManager from "@/components/QRCodeManager";
import Loader from "@/components/Loader";
import { apiClient } from "@/lib/api";
import type { AccountRole, Organization, UserProfile } from "@/types";

const STEPS = ["Profil & rôle", "Établissement", "Formulaire", "QR & équipe"];

export default function OnboardingPage() {
  const router = useRouter();
  const logoRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [role, setRole] = useState<AccountRole>("BOSS");
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiClient.get<UserProfile>("/auth/me/"), apiClient.get<Organization>("/org/me/")])
      .then(([me, orgRes]) => {
        setUser(me.data);
        setRole(me.data.role);
        setOrg(orgRes.data);
        setName(orgRes.data.name);
        setLogo(orgRes.data.logo_url || "");
        setReasons(orgRes.data.visit_reasons || []);
      })
      .catch(() => setError("Impossible de charger ton espace."))
      .finally(() => setLoading(false));
  }, []);

  const saveBranding = async () => {
    setSaving(true); setError("");
    try {
      const { data } = await apiClient.patch<Organization>("/org/me/", {
        name: name.trim(), logo_url: logo, visit_reasons: reasons,
      });
      setOrg(data); setStep(3);
    } catch { setError("Impossible d’enregistrer l’établissement."); }
    finally { setSaving(false); }
  };

  const pickLogo = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 900_000) { setError("Logo trop lourd (900 Ko maximum)."); return; }
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const addReason = () => {
    const value = reason.trim();
    if (value && !reasons.includes(value)) setReasons((prev) => [...prev, value]);
    setReason("");
  };

  if (loading) return <Loader label="Préparation de ton espace…" />;
  if (!user || !org) return <div className="mx-auto max-w-xl p-10 text-center text-error-text">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Mise en place</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-ink">Configurons ton accueil</h1>
        <p className="mt-2 text-sm text-ink-soft">Un parcours en quatre étapes. Tu peux passer l’invitation et la compléter plus tard.</p>
      </header>
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((label, index) => <div key={label} className="space-y-2"><div className={`h-1.5 rounded-full ${index + 1 <= step ? "bg-cta" : "bg-border"}`} /><span className="hidden text-xs text-ink-soft sm:block">{index + 1}. {label}</span></div>)}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-subtle sm:p-8">
        {step === 1 && <div className="space-y-6">
          <div><h2 className="text-2xl font-bold text-ink">Ton profil et ton rôle</h2><p className="mt-2 text-sm text-ink-soft">Ton avatar Google est conservé. Si tu as été invité, ton rôle et ton établissement sont déjà rattachés à ton compte.</p></div>
          <div className="flex items-center gap-4 rounded-xl bg-canvas p-4">
            {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="grid h-14 w-14 place-items-center rounded-full bg-cta text-white">{(user.email?.[0] || "U").toUpperCase()}</div>}
            <div><p className="font-semibold text-ink">{user.full_name || user.email}</p><p className="text-sm text-ink-soft">{user.email}</p></div>
          </div>
          <div className="rounded-xl border border-border p-4"><p className="text-xs uppercase tracking-wide text-ink-soft">Rôle détecté après authentification</p><p className="mt-1 font-semibold text-ink">{role === "BOSS" ? "Patron / responsable" : role === "GERANT" ? "Gérant" : "Membre du staff"}</p><p className="mt-1 text-sm text-ink-soft">{role === "BOSS" ? "Tu configures l’établissement et l’équipe." : "Ce rôle est lié à l’invitation de ton établissement."}</p></div>
          <div className="flex justify-end"><button onClick={() => setStep(2)} className="flex items-center gap-2 rounded-full bg-cta px-6 py-3 font-medium text-white">Continuer <ArrowRight size={16} /></button></div>
        </div>}

        {step === 2 && <div className="space-y-6">
          <div><h2 className="text-2xl font-bold text-ink">Ton établissement</h2><p className="mt-2 text-sm text-ink-soft">Le nom apparaît dans le formulaire visiteur et le logo sera utilisé sur le QR et dans la sidebar.</p></div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center"><button type="button" onClick={() => logoRef.current?.click()} className="group relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-canvas"><input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickLogo(e.target.files?.[0])} />{logo ? <Image src={logo} alt="Logo établissement" fill unoptimized className="object-contain p-2" /> : <Camera size={28} className="text-ink-soft" />}<span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center text-[10px] text-white opacity-0 transition group-hover:opacity-100">Changer</span></button><label className="flex-1 text-sm font-medium text-ink">Nom de l’établissement<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-3 outline-none focus:border-ink" /></label></div>
          <div><div className="flex items-center justify-between"><div><h3 className="font-semibold text-ink">Motifs de visite</h3><p className="text-sm text-ink-soft">Le bouton actualiser dans le formulaire visiteur récupérera ces choix.</p></div><button type="button" onClick={() => setReasons([...reasons])} className="text-sm font-medium text-ink underline">Actualiser</button></div><div className="mt-3 flex flex-wrap gap-2">{reasons.map((item) => <span key={item} className="flex items-center gap-1 rounded-full bg-canvas px-3 py-1.5 text-sm text-ink">{item}<button type="button" onClick={() => setReasons(reasons.filter((r) => r !== item))} aria-label={`Supprimer ${item}`}><X size={14} /></button></span>)}</div><div className="mt-3 flex gap-2"><input value={reason} onChange={(e) => setReason(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addReason()} placeholder="Ex. Rendez-vous, Livraison" className="min-w-0 flex-1 rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm" /><button type="button" onClick={addReason} className="rounded-lg border border-border px-3"><Plus size={18} /></button></div></div>
          {error && <p className="text-sm text-error-text">{error}</p>}<div className="flex justify-between"><button onClick={() => setStep(1)} className="rounded-full border border-border px-5 py-3 text-sm">Retour</button><button onClick={saveBranding} disabled={saving || !name.trim()} className="rounded-full bg-cta px-6 py-3 font-medium text-white disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer et continuer"}</button></div>
        </div>}

        {step === 3 && <div className="space-y-6"><div><h2 className="text-2xl font-bold text-ink">Le formulaire visiteur</h2><p className="mt-2 text-sm text-ink-soft">Ajoute les champs nécessaires, dont la signature. Après enregistrement, le formulaire se ferme automatiquement.</p></div><SimpleFormSetup onSaved={() => setStep(4)} /><button onClick={() => setStep(4)} className="rounded-full border border-border px-5 py-3 text-sm">Passer pour l’instant</button></div>}

        {step === 4 && <div className="space-y-6"><div><h2 className="text-2xl font-bold text-ink">QR code et équipe</h2><p className="mt-2 text-sm text-ink-soft">Le QR contient le logo de ton établissement au centre, comme un filigrane. Tu peux inviter maintenant ou passer.</p></div><div className="flex justify-center"><QRCodeManager qrToken={org.qr_secure_token} orgName={org.name} logoUrl={org.logo_url} canRegenerate={role === "BOSS"} /></div>{role === "BOSS" && <InviteStaff />}<div className="flex justify-between border-t border-border pt-5"><button onClick={() => setStep(3)} className="rounded-full border border-border px-5 py-3 text-sm">Retour</button><button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 rounded-full bg-cta px-6 py-3 font-medium text-white"><Check size={16} /> Terminer</button></div></div>}
      </section>
    </div>
  );
}
