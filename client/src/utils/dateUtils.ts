import dayjs from "dayjs";
import "dayjs/locale/fr";

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function formatFullDateFr(date: string): string {
  return dayjs(date)
    .locale("fr")
    .format("dddd DD MMMM YYYY")
    .replace(/^./, (char) => char.toUpperCase());
}

export function formatMediumDateFr(date: string): string {
  return dayjs(date)
    .locale("fr")
    .format("MMMM YYYY")
    .replace(/^./, (char) => char.toUpperCase());
}

export function formatDateFr(date: string): string {
  return dayjs(date).format("DD/MM/YYYY");
}
