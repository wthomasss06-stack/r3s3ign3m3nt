import Image from "next/image";

/** Marque officielle (fournie par l'utilisateur) — PNG transparent, jamais recréée en texte. */
export default function Logo({
  size = 32,
  className = "",
  back = false,
}: {
  size?: number;
  className?: string;
  back?: boolean;
}) {
  const combinedClassName = [
    back ? "rounded-xl border border-border bg-white/90 p-2 shadow-sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Image
      src="/brand/logo-mark.png"
      alt="R3S3IGN3M3NT"
      width={size}
      height={size}
      className={combinedClassName}
      priority
    />
  );
}
