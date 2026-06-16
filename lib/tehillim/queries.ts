import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  tehillimChapters,
  tehillimComments,
  tehillimFavorites,
  tehillimHighlights,
  tehillimPhraseBreaks,
  tehillimReadLogs,
  tehillimUserPreferences,
  tehillimVerses,
} from "@/db/schema";
import { resolveTehillimPreferences } from "@/lib/tehillim/preferences";

export async function getTehillimUserData(userId: string) {
  const [preferences, favorites, readLogs] = await Promise.all([
    db
      .select()
      .from(tehillimUserPreferences)
      .where(eq(tehillimUserPreferences.userId, userId))
      .limit(1),
    db.select().from(tehillimFavorites).where(eq(tehillimFavorites.userId, userId)),
    db.select().from(tehillimReadLogs).where(eq(tehillimReadLogs.userId, userId)),
  ]);

  const readCounts = readLogs.reduce<Record<number, number>>((acc, log) => {
    acc[log.chapter] = (acc[log.chapter] ?? 0) + log.quantity;
    return acc;
  }, {});

  return {
    preferences: resolveTehillimPreferences(preferences[0]),
    favoriteChapters: new Set(favorites.map((entry) => entry.chapter)),
    readCounts,
  };
}

export async function getChapterData(userId: string, chapter: number) {
  const [meta, verses, comments, highlights, phraseBreaks, userData] =
    await Promise.all([
      db
        .select()
        .from(tehillimChapters)
        .where(eq(tehillimChapters.chapter, chapter))
        .limit(1),
      db
        .select()
        .from(tehillimVerses)
        .where(eq(tehillimVerses.chapter, chapter))
        .orderBy(tehillimVerses.verse),
      db
        .select()
        .from(tehillimComments)
        .where(
          and(eq(tehillimComments.userId, userId), eq(tehillimComments.chapter, chapter)),
        ),
      db
        .select()
        .from(tehillimHighlights)
        .where(
          and(eq(tehillimHighlights.userId, userId), eq(tehillimHighlights.chapter, chapter)),
        ),
      db
        .select()
        .from(tehillimPhraseBreaks)
        .where(
          and(eq(tehillimPhraseBreaks.userId, userId), eq(tehillimPhraseBreaks.chapter, chapter)),
        ),
      getTehillimUserData(userId),
    ]);

  return {
    meta: meta[0],
    verses,
    comments,
    highlights,
    phraseBreaks,
    ...userData,
  };
}
