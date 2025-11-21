import dayjs from "dayjs";

/**
 * Sets a property on an object if the new value is different from the current one.
 *
 * - Ignores `undefined` values (property remains unchanged).
 * - Supports null assignment when explicitly allowed.
 * - Trims string values automatically before comparison.
 * - Compares Date objects and date-like strings using timestamps for reliable change detection.
 * - Performs deep comparison for objects (using JSON.stringify).
 *
 * @param {Record<string, any>} target - Object to update.
 * @param {string} key - Property name to update.
 * @param {any} value - New value to set.
 * @param {boolean} allowedToBeNull - Whether null values are allowed.
 * @returns {boolean} True if the value was changed, false otherwise.
 */
export function setIfChanged(target: Record<string, any>, key: string, value: any, allowedToBeNull: boolean): boolean {
  // Ignore if value is undefined
  if (value === undefined) return false;

  let newValue = value;

  // Handle explicit 'null' assignment
  if (value === null) {
    if (!allowedToBeNull || target[key] === null) return false;
    target[key] = null;
    return true;
  }

  // Handle string trimming and empty string conversion to null
  if (typeof value === "string") {
    newValue = value.trim();

    if (!newValue) {
      if (allowedToBeNull) {
        newValue = null;
      } else {
        return false;
      }
    }
  }

  // Handle Date comparison using timestamps
  if (newValue instanceof Date || target[key] instanceof Date) {
    const newTimestamp = newValue instanceof Date ? newValue.getTime() : dayjs(newValue).valueOf();
    const existingTimestamp = target[key] instanceof Date ? target[key].getTime() : dayjs(target[key]).valueOf();

    if (newTimestamp === existingTimestamp && newTimestamp !== 0) return false;

    if (!(newValue instanceof Date)) {
      newValue = dayjs(newValue).toDate();
    }
  }

  // Handle complex object comparison (via JSON)
  if (typeof newValue === "object" && newValue !== null && typeof target[key] === "object" && target[key] !== null) {
    if (JSON.stringify(newValue) === JSON.stringify(target[key])) return false;
  }
  // Handle primitive value comparison
  else if (newValue === target[key]) {
    console.log("Bug check: newValue and target[key] are equal but update happens!");
    return false;
  }

  console.log(`SET: Key=${key}, OldValue=${target[key]}, NewValue=${newValue}`);

  target[key] = newValue;
  return true;
}
