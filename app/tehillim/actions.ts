"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  tehillimComments,
  tehillimFavorites,
  tehillimHighlights,
  tehillimPhraseBreaks,
  tehillimReadLogs,
  tehillimReadSessions,
  tehillimUserPreferences,
} from "@/db/schema";
import { requireAppAccess } from "@/lib/access";
import { getBulkReadChapters } from "@/lib/tehillim/bulk";
import {
  buildReadSessionLabel,
  buildReadSessionParams,
  type TehillimReadSource,
} from "@/lib/tehillim/read-sessions";

const TEHILLIM_PATHS = [
  "/tehillim",
  "/tehillim/chapters",
  "/tehillim/chapter",
  "/tehillim/bookmarks",
  "/tehillim/audit",
];

function revalidateTehillim() {
  for (const path of TEHILLIM_PATHS) {
    revalidatePath(path);
  }
}

export async function updateTehillimPreferences(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const fontFamily = z.string().min(1).parse(formData.get("fontFamily"));
  const fontSize = z.coerce.number().int().min(80).max(160).parse(
    formData.get("fontSize") ?? 100,
  );
  const showKamatzKatan = formData.get("showKamatzKatan") === "on";
  const showEnglish = formData.get("showEnglish") === "on";
  const showTeamim = formData.get("showTeamim") === "on";
  const darkMode = formData.get("darkMode") === "on";

  await db
    .insert(tehillimUserPreferences)
    .values({
      userId: user.id,
      fontFamily,
      fontSize,
      showKamatzKatan,
      showEnglish,
      showTeamim,
      darkMode,
    })
    .onConflictDoUpdate({
      target: tehillimUserPreferences.userId,
      set: {
        fontFamily,
        fontSize,
        showKamatzKatan,
        showEnglish,
        showTeamim,
        darkMode,
        updatedAt: new Date(),
      },
    });

  revalidateTehillim();
}

export async function adjustFontSize(delta: number) {
  const user = await requireAppAccess("tehillim");
  const [existing] = await db
    .select()
    .from(tehillimUserPreferences)
    .where(eq(tehillimUserPreferences.userId, user.id))
    .limit(1);

  const fontSize = Math.min(
    160,
    Math.max(80, (existing?.fontSize ?? 100) + delta),
  );

  await db
    .insert(tehillimUserPreferences)
    .values({ userId: user.id, fontSize })
    .onConflictDoUpdate({
      target: tehillimUserPreferences.userId,
      set: { fontSize, updatedAt: new Date() },
    });

  revalidateTehillim();
}

export async function toggleDarkMode() {
  const user = await requireAppAccess("tehillim");
  const [existing] = await db
    .select()
    .from(tehillimUserPreferences)
    .where(eq(tehillimUserPreferences.userId, user.id))
    .limit(1);

  const darkMode = !(existing?.darkMode ?? false);

  await db
    .insert(tehillimUserPreferences)
    .values({ userId: user.id, darkMode })
    .onConflictDoUpdate({
      target: tehillimUserPreferences.userId,
      set: { darkMode, updatedAt: new Date() },
    });

  revalidateTehillim();
}

export async function toggleFavorite(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const chapter = z.coerce.number().int().min(1).max(150).parse(formData.get("chapter"));
  const isFavorite = formData.get("isFavorite") === "true";

  if (isFavorite) {
    await db
      .delete(tehillimFavorites)
      .where(
        and(
          eq(tehillimFavorites.userId, user.id),
          eq(tehillimFavorites.chapter, chapter),
        ),
      );
  } else {
    await db
      .insert(tehillimFavorites)
      .values({ userId: user.id, chapter })
      .onConflictDoNothing();

    redirect(`/tehillim/chapter?chapter=${chapter}&saved=1`);
  }

  revalidateTehillim();
}

export async function removeFavorite(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const chapter = z.coerce.number().int().min(1).max(150).parse(formData.get("chapter"));

  await db
    .delete(tehillimFavorites)
    .where(
      and(eq(tehillimFavorites.userId, user.id), eq(tehillimFavorites.chapter, chapter)),
    );

  revalidateTehillim();
}

export async function addComment(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const chapter = z.coerce.number().int().min(1).max(150).parse(formData.get("chapter"));
  const verse = z.coerce.number().int().min(1).parse(formData.get("verse"));
  const comment = z.string().min(1).parse(formData.get("comment"));

  await db.insert(tehillimComments).values({
    userId: user.id,
    chapter,
    verse,
    marker: "*",
    comment,
  });

  revalidateTehillim();
}

export async function addWordHighlight(input: {
  chapter: number;
  startVerse: number;
  endVerse: number;
  startWord?: number;
  endWord?: number;
}) {
  const user = await requireAppAccess("tehillim");

  await db.insert(tehillimHighlights).values({
    userId: user.id,
    chapter: input.chapter,
    startVerse: input.startVerse,
    endVerse: input.endVerse,
    startWord: input.startWord,
    endWord: input.endWord,
    color: "yellow",
  });

  revalidateTehillim();
}

export async function addHighlight(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const chapter = z.coerce.number().int().min(1).max(150).parse(formData.get("chapter"));
  const startVerse = z.coerce.number().int().min(1).parse(formData.get("startVerse"));
  const endVerse = z.coerce.number().int().min(startVerse).parse(formData.get("endVerse"));
  const startWord = formData.get("startWord");
  const endWord = formData.get("endWord");

  await db.insert(tehillimHighlights).values({
    userId: user.id,
    chapter,
    startVerse,
    endVerse,
    startWord: startWord ? z.coerce.number().int().parse(startWord) : undefined,
    endWord: endWord ? z.coerce.number().int().parse(endWord) : undefined,
    color: "yellow",
  });

  revalidateTehillim();
}

export async function clearHighlights(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const ids = z.array(z.string().uuid()).parse(formData.getAll("highlightId"));

  if (ids.length > 0) {
    await db
      .delete(tehillimHighlights)
      .where(
        and(
          eq(tehillimHighlights.userId, user.id),
          inArray(tehillimHighlights.id, ids),
        ),
      );
  }

  revalidateTehillim();
}

export async function removeHighlightsByIds(ids: string[]) {
  const user = await requireAppAccess("tehillim");

  if (ids.length === 0) {
    return;
  }

  await db
    .delete(tehillimHighlights)
    .where(
      and(eq(tehillimHighlights.userId, user.id), inArray(tehillimHighlights.id, ids)),
    );

  revalidateTehillim();
}

export async function togglePhraseBreak(input: {
  chapter: number;
  verse: number;
  afterWordIndex: number;
  breakType: "newline" | "tab";
}) {
  const user = await requireAppAccess("tehillim");

  const [existing] = await db
    .select()
    .from(tehillimPhraseBreaks)
    .where(
      and(
        eq(tehillimPhraseBreaks.userId, user.id),
        eq(tehillimPhraseBreaks.chapter, input.chapter),
        eq(tehillimPhraseBreaks.verse, input.verse),
        eq(tehillimPhraseBreaks.afterWordIndex, input.afterWordIndex),
      ),
    )
    .limit(1);

  if (existing) {
    await db.delete(tehillimPhraseBreaks).where(eq(tehillimPhraseBreaks.id, existing.id));
  } else {
    await db.insert(tehillimPhraseBreaks).values({
      userId: user.id,
      chapter: input.chapter,
      verse: input.verse,
      afterWordIndex: input.afterWordIndex,
      breakType: input.breakType,
    });
  }

  revalidateTehillim();
}

async function createReadSession(
  userId: string,
  source: TehillimReadSource,
  start: number,
  end: number,
  chapters: number[],
) {
  const params = buildReadSessionParams(source, start, end);
  const label = buildReadSessionLabel(source, params);

  const [session] = await db
    .insert(tehillimReadSessions)
    .values({
      userId,
      source,
      label,
      params,
    })
    .returning();

  if (chapters.length > 0) {
    await db.insert(tehillimReadLogs).values(
      chapters.map((chapter) => ({
        userId,
        sessionId: session.id,
        chapter,
        quantity: 1,
        source,
      })),
    );
  }

  return session;
}

export async function markChapterRead(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const chapter = z.coerce.number().int().min(1).max(150).parse(formData.get("chapter"));

  await createReadSession(user.id, "single", chapter, chapter, [chapter]);
  revalidateTehillim();
}

export async function bulkMarkRead(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const mode = z
    .enum(["range", "weekday", "month", "book"])
    .parse(formData.get("mode"));
  const start = z.coerce.number().int().min(1).max(150).parse(formData.get("start"));
  const end = z.coerce.number().int().min(1).max(150).parse(formData.get("end"));

  const chapters = getBulkReadChapters(mode, start, end);

  if (chapters.length > 0) {
    await createReadSession(user.id, mode, start, end, chapters);
  }

  revalidateTehillim();
}

export async function getReadSessions() {
  const user = await requireAppAccess("tehillim");

  return db
    .select()
    .from(tehillimReadSessions)
    .where(eq(tehillimReadSessions.userId, user.id))
    .orderBy(desc(tehillimReadSessions.reportedAt));
}
