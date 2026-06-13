import { TEHILLIM_CHAPTERS } from "./metadata";

export type TehillimBulkMode = "range" | "weekday" | "month";

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

  if (mode === "weekday") {
    return TEHILLIM_CHAPTERS.filter((entry) => entry.dayOfWeek === start).map(
      (entry) => entry.chapter,
    );
  }

  return TEHILLIM_CHAPTERS.filter((entry) => entry.dayOfMonth === start).map(
    (entry) => entry.chapter,
  );
}
