import dayjs from "dayjs";

export function toDateOnly(datetime: Date | string | number) {
  if (!datetime) return null;

  return dayjs(datetime).format("YYYY-MM-DD");
}

export function toTimeOnly(datetime: Date | string | number) {
  if (!datetime) return null;

  return dayjs(datetime).format("HH:mm");
}

export function formatDateTime(date: Date | string | number | null) {
  if (!date) return null;

  return { date: toDateOnly(date), time: toTimeOnly(date) };
}

export function calculateDuration(
  startDate: Date | string | number | null,
  endDate: Date | string | number | null,
  unit: "second" | "minute" | "hour" | "day" | "month" | "year" = "minute"
) {
  if (!startDate || !endDate) return null;

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return end.diff(start, unit);
}

export function calculateAge(birthDate: Date | string | number | null) {
  if (!birthDate) return null;

  const today = dayjs();
  const birth = dayjs(birthDate);

  let age = today.diff(birth, "year");

  if (today.isBefore(birth.add(age, "year"))) {
    age--;
  }

  return age;
}
