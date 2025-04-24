/**
 * Convertit une datetime en date uniquement
 */
export function toDateOnly(datetime: Date): string {
  return datetime.toLocaleDateString("fr-CA");
}

/**
 * Convertit une datetime en heure uniquement
 */
export function toTimeOnly(datetime: Date): string {
  return datetime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Retourne la durée en minutes entre deux dates
 */
export function getDuration(start: Date, end: Date): number {
  return Math.round(Math.abs(end.getTime() - start.getTime()) / 60000);
}

/**
 * Retourne l'âge en années à partir d'une date de naissance
 */
export function getAge(birthDate: Date): string {
  const date = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();

  if (today < new Date(today.getFullYear(), date.getMonth(), date.getDate())) {
    age--;
  }

  return `${age} ans`;
}
