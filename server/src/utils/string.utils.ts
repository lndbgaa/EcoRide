export function capitalize(str: string): string {
  if (!str) return str;

  return str
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());
}
