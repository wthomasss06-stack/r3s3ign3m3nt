/** Prénom affichable : premier mot du nom complet, ou début de l’adresse e-mail à défaut. */
export function firstNameOf(nameOrEmail?: string | null): string {
  const raw = (nameOrEmail ?? "").trim();
  if (!raw) return "";
  if (raw.includes("@")) {
    const local = raw.split("@")[0] ?? "";
    const word = local.split(/[._+-]/)[0] ?? local;
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
  }
  return raw.split(/\s+/)[0] ?? raw;
}

/** Souhait adapté à l’heure locale de l’appareil (« Bonne soirée », etc.). */
export function dayPartWish(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 18) return "Bonne soirée";
  if (hour < 12) return "Bonne journée";
  return "Bonne fin de journée";
}
