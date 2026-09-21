import type { Config } from "tailwindcss";

// Design system unifié, piloté par variables CSS (voir globals.css) pour le mode
// sombre — chaque token ci-dessous lit sa valeur RGB courante via rgb(var(--x) / <alpha-value>),
// ce qui garde les modificateurs d'opacité Tailwind (ex: bg-canvas/50) fonctionnels.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "ui-sans-serif", "system-ui", "sans-serif"],
        "mk-serif": ["var(--font-serif)", "Georgia", "serif"],
        "mk-sans": ["var(--font-sans)", "-apple-system", "sans-serif"],
        "mk-mono": ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        canvas: "rgb(var(--c-canvas) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--c-ink-soft) / <alpha-value>)",
        cta: "rgb(var(--c-cta) / <alpha-value>)",
        "cta-hover": "rgb(var(--c-cta-hover) / <alpha-value>)",
        "cta-ink": "rgb(var(--c-cta-ink) / <alpha-value>)",
        "success-bg": "rgb(var(--c-success-bg) / <alpha-value>)",
        "success-text": "rgb(var(--c-success-text) / <alpha-value>)",
        "error-bg": "rgb(var(--c-error-bg) / <alpha-value>)",
        "error-text": "rgb(var(--c-error-text) / <alpha-value>)",
        "info-bg": "rgb(var(--c-info-bg) / <alpha-value>)",
        "info-text": "rgb(var(--c-info-text) / <alpha-value>)",
        // Alias "mk-" (memes variables) pour les fichiers de la zone marketing déjà
        // écrits avec ces noms explicites.
        "mk-ink": "rgb(var(--c-ink) / <alpha-value>)",
        "mk-deep": "rgb(var(--c-deep) / <alpha-value>)",
        "deep-ink": "rgb(var(--c-deep-ink) / <alpha-value>)",
        "mk-moss": "rgb(var(--c-ink-soft) / <alpha-value>)",
        "mk-sage": "rgb(var(--c-sage) / <alpha-value>)",
        "mk-lime": "rgb(var(--c-lime) / <alpha-value>)",
        "mk-paper": "rgb(var(--c-canvas) / <alpha-value>)",
        "mk-stone": "rgb(var(--c-border) / <alpha-value>)",
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
