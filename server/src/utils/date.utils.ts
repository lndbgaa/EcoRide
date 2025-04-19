//
export function toDateOnly(datetime: Date): string {
  return datetime.toLocaleDateString("fr-CA");
}

//
export function toTimeOnly(datetime: Date): string {
  return datetime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

//
export function getDuration(datetime1: Date, datetime2: Date): number {
  return Math.round(Math.abs(datetime2.getTime() - datetime1.getTime()) / 60000);
}

export function getAge(birthDate: Date): string {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
    age--;
  }

  return `${age} ans`;
}
