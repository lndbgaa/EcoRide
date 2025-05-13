import dayjs from "dayjs";

/**
 * Convertit une datetime en date uniquement au format DD/MM/YYYY
 */
export function toDateOnly(datetime: Date | string): string {
  return dayjs(datetime).tz("Europe/Paris").format("YYYY-MM-DD");
}

/**
 * Convertit une datetime en heure uniquement au format HH:MM
 */
export function toTimeOnly(datetime: Date | string): string {
  return dayjs(datetime).tz("Europe/Paris").format("HH:mm");
}

/**
 * Retourne la durée en minutes entre deux dates
 */
export function getDuration(start: Date | string, end: Date | string): number {
  const startDate = dayjs(start).tz("Europe/Paris", true);
  const endDate = dayjs(end).tz("Europe/Paris", true);
  return Math.round(Math.abs(endDate.diff(startDate, "minutes")));
}

/**
 * Retourne l'âge à partir d'une date de naissance
 */
export function getAge(birthDate: Date | string): number {
  const birth = dayjs.tz(birthDate, "Europe/Paris");
  const today = dayjs().tz("Europe/Paris");

  let age = today.year() - birth.year();

  const birthdayThisYear = birth.set("year", today.year());

  if (today.isBefore(birthdayThisYear)) {
    age--;
  }

  return age;
}
