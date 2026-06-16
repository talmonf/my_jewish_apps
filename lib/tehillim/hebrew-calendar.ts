export function formatHebrewDate(date = new Date()) {
  return new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getHebrewDayOfMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
    day: "numeric",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value;
  return day ? Number(day) : 1;
}

export function getGregorianWeekday(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}
