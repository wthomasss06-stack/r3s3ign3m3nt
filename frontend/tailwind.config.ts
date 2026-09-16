import type { Config } from "tailwindcss";

// Design system unifié — palette et police de base extraites de Fichier.html
// (vert forêt + crème), appliquées à TOUT le site via ces tokens centraux : un
// composant qui utilise "bg-cta" ou "text-ink" hérite automatiquement, sans
// modification de son propre code. Playfair Display / DM Mono restent chargées
// uniquement dans la zone marketing (accent décoratif, pas nécessaire sur les
// libellés du formulaire kiosque ni du dashboard).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "ui-sans-serif", "system-ui", "sans-serif"],
        "mk-serif": ["var(--font-serif)", "Georgia", "serif"],
        "mk-sans": ["var(--font-sans)", "-apple-system", "sans-serif"],
        "mk-mono": ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        // Tokens de base — utilisés partout (dashboard, kiosque, marketing)
        canvas: "#eeeee2",
        surface: "#FFFFFF",
        border: "#d6d8c9",
        ink: "#12231a",
        "ink-soft": "#536c57",
        cta: "#173426",
        "cta-hover": "#536c57",
        "success-bg": "#EDF3EC",
        "success-text": "#346538",
        "error-bg": "#FDEBEC",
        "error-text": "#9F2F2D",
        "info-bg": "#E1F3FE",
        "info-text": "#1F6C9F",
        // Alias "mk-" conservés (mêmes valeurs) pour les fichiers de la zone
        // marketing déjà écrits avec ces noms explicites.
        "mk-ink": "#12231a",
        "mk-deep": "#173426",
        "mk-moss": "#536c57",
        "mk-sage": "#bac8ad",
        "mk-lime": "#d6e7a8",
        "mk-paper": "#eeeee2",
        "mk-stone": "#d6d8c9",
      },
      borderRadius: {
        md: "6px",
        lg: "10px",
        xl: "12px",
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0,0,0,0.04)",
      },
      transitionTimingFunction: {
        quiet: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
