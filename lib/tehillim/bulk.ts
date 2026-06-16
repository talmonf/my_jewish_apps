import { TEHILLIM_CHAPTERS } from "./metadata";

export type TehillimBulkMode = "range" | "weekday" | "month" | "book";

export function getBulkReadChapters(
  mode: TehillimBulkMode,
  start: number,
  end: number,
) {
  if (mode === "range") {
    const low = Math.min(start, end);
    const high = Math.max(start, end);

    return TEHILLIM_CHAPTERS.filter(
      (entry) => entry.chapter >= low && entry.chapter <= high,
    ).map((entry) => entry.chapter);
  }

  if (mode === "book") {
    return TEHILLIM_CHAPTERS.filter((entry) => entry.book === start).map(
      (entry) => entry.chapter,
    );
  }

  if (mode === "weekday") {
    return TEHILLIM_CHAPTERS.filter((entry) => entry.dayOfWeek === start).map(
      (entry) => entry.chapter,
    );
  }

  const low = Math.min(start, end);
  const high = Math.max(start, end);

  return TEHILLIM_CHAPTERS.filter(
    (entry) => entry.dayOfMonth >= low && entry.dayOfMonth <= high,
  ).map((entry) => entry.chapter);
}

export function getChaptersForMonthDay(day: number) {
  return getBulkReadChapters("month", day, day);
}

export function getChaptersForWeekday(weekday: number) {
  return getBulkReadChapters("weekday", weekday, weekday);
}

export function getChaptersForBook(book: number) {
  return getBulkReadChapters("book", book, book);
}
