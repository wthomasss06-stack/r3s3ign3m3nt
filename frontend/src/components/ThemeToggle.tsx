"use client";
import { Moon, Sun } from "@phosphor-icons/react";

import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className={`relative flex h-8 w-14 items-center rounded-full border border-border bg-surface px-1 transition-colors ${className}`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-cta text-cta-ink shadow-subtle transition-transform duration-300 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon size={13} weight="bold" /> : <Sun size={13} weight="bold" />}
      </span>
    </button>
  );
}
