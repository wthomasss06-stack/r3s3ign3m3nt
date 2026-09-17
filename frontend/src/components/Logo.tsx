"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cloudImage } from "@/lib/cloudinary";

/** Marque officielle — PNG transparent. Clic = retour arrière (ou accueil si pas d'historique). */
export default function Logo({
  size = 32,
  className = "",
  back = false,
  href,
}: {
  size?: number;
  className?: string;
  /** Si true, clic = page précédente (fallback /). */
  back?: boolean;
  /** Lien explicite ; ignoré si back=true. */
  href?: string;
}) {
  const router = useRouter();

  const img = (
    <Image
      src={cloudImage("brand/logo-mark.png")}
      alt="R3S3IGN3M3NT"
      width={size}
      height={size}
      className={className}
      priority
    />
  );

  if (back) {
    return (
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
        className="rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-cta/40"
        aria-label="Retour"
      >
        {img}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className="rounded-lg transition-opacity hover:opacity-80">
        {img}
      </Link>
    );
  }

  return img;
}
