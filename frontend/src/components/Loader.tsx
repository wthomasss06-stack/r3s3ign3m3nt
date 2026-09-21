import Logo from "./Logo";

/** Écran/bloc de chargement de marque — remplace les "Chargement..." texte nu. */
export default function Loader({ label = "Chargement...", fullScreen = true }: { label?: string; fullScreen?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? "min-h-screen" : "py-16"}`}
    >
      <Logo size={96} className="animate-pulse" />
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}
