import type { TehillimReadSessionParams } from "@/db/schema";

import { toHebrewNumeral } from "./gematria";

const WEEKDAY_NAMES = [
  "",
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

export type TehillimReadSource =
  | "single"
  | "range"
  | "weekday"
  | "month"
  | "book";

export function buildReadSessionLabel(
  source: TehillimReadSource,
  params: TehillimReadSessionParams,
) {
  if ("chapter" in params) {
    return `פרק ${toHebrewNumeral(params.chapter)}`;
  }

  if ("startChapter" in params) {
    return `פרקים ${toHebrewNumeral(params.startChapter)}–${toHebrewNumeral(params.endChapter)}`;
  }

  if ("book" in params) {
    return `ספר ${params.book}`;
  }

  if ("weekday" in params) {
    return `ליום ${WEEKDAY_NAMES[params.weekday] ?? params.weekday}`;
  }

  if ("monthDayStart" in params) {
    return `ימים ${params.monthDayStart}–${params.monthDayEnd}`;
  }

  if ("monthDay" in params) {
    return `יום ${params.monthDay} בחודש`;
  }

  return source;
}

export function buildReadSessionParams(
  source: TehillimReadSource,
  start: number,
  end: number,
): TehillimReadSessionParams {
  switch (source) {
    case "single":
      return { chapter: start };
    case "range":
      return { startChapter: Math.min(start, end), endChapter: Math.max(start, end) };
    case "book":
      return { book: start };
    case "weekday":
      return { weekday: start };
    case "month":
      return start === end
        ? { monthDay: start }
        : { monthDayStart: Math.min(start, end), monthDayEnd: Math.max(start, end) };
    default:
      return { chapter: start };
  }
}
