export const LEGAL_LAST_UPDATED = "15 septembre 2026";

export default function LegalLayout({
  title,
  lastUpdated = LEGAL_LAST_UPDATED,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="app-shell mx-auto max-w-2xl py-16 sm:py-20">
      <p className="font-mk-mono text-[10px] uppercase tracking-[0.1em] text-mk-moss">
        Dernière mise à jour : {lastUpdated}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{title}</h1>
      <div className="prose-legal mt-8 text-[15px] leading-relaxed text-mk-ink/85">{children}</div>
    </article>
  );
}
