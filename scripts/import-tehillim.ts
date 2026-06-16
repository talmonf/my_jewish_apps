import "@/envConfig";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { tehillimChapters, tehillimVerses } from "@/db/schema";
import {
  SAMPLE_TEHILLIM_VERSES,
  TEHILLIM_CHAPTERS,
  tokenizeHebrew,
} from "@/lib/tehillim/metadata";
import { normalizeSefariaText } from "@/lib/tehillim/sefaria";

type SefariaResponse = {
  he?: string[];
  text?: string[];
};

async function fetchSefariaChapter(chapter: number) {
  const response = await fetch(
    `https://www.sefaria.org/api/texts/Psalms.${chapter}?context=0`,
  );

  if (!response.ok) {
    throw new Error(`Sefaria request failed for chapter ${chapter}.`);
  }

  const data = (await response.json()) as SefariaResponse;
  return data.he?.map((hebrew, index) => ({
    chapter,
    verse: index + 1,
    hebrew: normalizeSefariaText(hebrew),
    english: data.text?.[index]
      ? normalizeSefariaText(data.text[index])
      : undefined,
  }));
}

async function importTehillim() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  await db
    .insert(tehillimChapters)
    .values(TEHILLIM_CHAPTERS)
    .onConflictDoNothing();

  const importedVerses = [];

  for (const chapter of TEHILLIM_CHAPTERS) {
    try {
      const verses = await fetchSefariaChapter(chapter.chapter);
      importedVerses.push(...(verses ?? []));
    } catch (error) {
      console.warn(`Skipped chapter ${chapter.chapter}:`, error);
    }
  }

  const verses = importedVerses.length > 0 ? importedVerses : SAMPLE_TEHILLIM_VERSES;

  await db
    .insert(tehillimVerses)
    .values(
      verses.map((verse) => ({
        ...verse,
        tokens: tokenizeHebrew(verse.hebrew, verse.verse),
      })),
    )
    .onConflictDoUpdate({
      target: [tehillimVerses.chapter, tehillimVerses.verse],
      set: {
        hebrew: sql`excluded.hebrew`,
        english: sql`excluded.english`,
        tokens: sql`excluded.tokens`,
      },
    });

  console.log(`Imported ${verses.length} Tehillim verses.`);
}

importTehillim().catch((error) => {
  console.error(error);
  process.exit(1);
});
