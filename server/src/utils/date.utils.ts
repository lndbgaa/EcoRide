import { dayjs } from "@/config";

import type { DateTimeDTO } from "@/types";
import type { ManipulateType } from "dayjs";

/**
 *
 * @param {Date} datetime
 * @returns {string}
 */
export function formatDateOnly(datetime: Date): string {
  return dayjs(datetime).format("YYYY-MM-DD");
}

/**
 *
 * @param {string} date
 * @param {string} time
 * @returns {DateTimeDTO}
 */
export function parseDateTimeToUTC(date: string, time: string): Date {
  const dateTimeStr = `${date} ${time}`;

  return dayjs.tz(dateTimeStr, "Europe/Paris").utc().toDate();
}

/**
 *
 * @param {Date} utcDate
 * @returns {DateTimeDTO}
 */
export function formatDateTimeFromUTC(utcDate: Date): DateTimeDTO {
  const parisDateTime = dayjs(utcDate).tz("Europe/Paris");

  return {
    date: parisDateTime.format("YYYY-MM-DD"),
    time: parisDateTime.format("HH:mm"),
  };
}

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {ManipulateType} unit
 * @returns {number}
 */
export function calculateDuration(
  startDate: Date,
  endDate: Date,
  unit: ManipulateType = "minute"
): number {
  return dayjs(endDate).diff(dayjs(startDate), unit);
}

/**
 *
 * @param {Date} birthDate
 * @returns {number}
 */
export function calculateAge(birthDate: Date): number {
  const today = dayjs();
  const birth = dayjs(birthDate);

  let age = today.diff(birth, "year");

  if (today.isBefore(birth.add(age, "year"))) {
    age--;
  }

  return age;
}
