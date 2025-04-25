/**
 * Convertit une datetime en date uniquement au format DD/MM/YYYY
 */
export function toDateOnly(datetime: Date | string): string {
  return new Date(datetime).toISOString().split("T")[0];
}

/**
 * Convertit une datetime en heure uniquement au format HH:MM
 */
export function toTimeOnly(datetime: Date | string): string {
  return new Date(datetime).toISOString().split("T")[1].split(".")[0];
}

/**
 * Retourne la durée en minutes entre deux dates
 */
export function getDuration(start: Date | string, end: Date | string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round(Math.abs(endDate.getTime() - startDate.getTime()) / 60000);
}

/**
 * Retourne l'âge en années à partir d'une date de naissance (string)
 */
export function getAge(birthDate: Date | string): number {
  const date = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();

  if (today < new Date(today.getFullYear(), date.getMonth(), date.getDate())) {
    age--;
  }

  return age;
}
