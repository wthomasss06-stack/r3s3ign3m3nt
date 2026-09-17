import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "480px",
        "3xl": "1920px",
      },
      maxWidth: {
        shell: "var(--container-max)",
        "shell-wide": "var(--container-wide)",
        prose: "var(--content-max)",
        auth: "26.25rem",
      },
      spacing: {
        header: "var(--header-h)",
        "mobile-nav": "var(--mobile-nav-h)",
        "page-x": "var(--page-x)",
        "page-y": "var(--page-y)",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
      },
      fontFamily: {
        heading: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "ui-sans-serif", "system-ui", "sans-serif"],
        "mk-serif": ["var(--font-serif)", "Georgia", "serif"],
        "mk-sans": ["var(--font-sans)", "-apple-system", "sans-serif"],
        "mk-mono": ["var(--font-sans)", "sans-serif"],
      },
      colors: {
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
        card: "var(--radius-card)",
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0,0,0,0.04)",
        card: "var(--shadow-card)",
        "card-lg": "var(--shadow-card-lg)",
      },
      transitionTimingFunction: {
        quiet: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      fontSize: {
        "fluid-display": ["var(--text-display)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        "fluid-h1": ["var(--text-h1)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "fluid-h2": ["var(--text-h2)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "fluid-lead": ["var(--text-lead)", { lineHeight: "1.6" }],
      },
    },
  },
  plugins: [],
};
export default config;
