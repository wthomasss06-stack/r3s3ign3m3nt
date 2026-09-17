import Image from "next/image";

import { cloudImage } from "@/lib/cloudinary";

/** Marque officielle (fournie par l'utilisateur) — PNG transparent, jamais recréée en texte. */
export default function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={cloudImage("brand/logo-mark.png")}
      alt="R3S3IGN3M3NT"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
