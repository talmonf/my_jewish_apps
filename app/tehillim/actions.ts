"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  tehillimComments,
  tehillimFavorites,
  tehillimHighlights,
  tehillimReadLogs,
  tehillimUserPreferences,
} from "@/db/schema";
import { requireAppAccess } from "@/lib/access";
import { getBulkReadChapters } from "@/lib/tehillim/bulk";

export async function updateTehillimPreferences(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const fontFamily = z.string().min(1).parse(formData.get("fontFamily"));
  const showKamatzKatan = formData.get("showKamatzKatan") === "on";

  await db
    .insert(tehillimUserPreferences)
    .values({ userId: user.id, fontFamily, showKamatzKatan })
    .onConflictDoUpdate({
      target: tehillimUserPreferences.userId,
      set: { fontFamily, showKamatzKatan, updatedAt: new Date() },
    });

  revalidatePath("/tehillim");
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
  }

  revalidatePath("/tehillim");
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

  revalidatePath("/tehillim");
}

export async function addHighlight(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const chapter = z.coerce.number().int().min(1).max(150).parse(formData.get("chapter"));
  const startVerse = z.coerce.number().int().min(1).parse(formData.get("startVerse"));
  const endVerse = z.coerce.number().int().min(startVerse).parse(formData.get("endVerse"));

  await db.insert(tehillimHighlights).values({
    userId: user.id,
    chapter,
    startVerse,
    endVerse,
    color: "yellow",
  });

  revalidatePath("/tehillim");
}

export async function markChapterRead(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const chapter = z.coerce.number().int().min(1).max(150).parse(formData.get("chapter"));

  await db.insert(tehillimReadLogs).values({
    userId: user.id,
    chapter,
    quantity: 1,
    source: "single",
  });

  revalidatePath("/tehillim");
}

export async function bulkMarkRead(formData: FormData) {
  const user = await requireAppAccess("tehillim");
  const mode = z.enum(["range", "weekday", "month"]).parse(formData.get("mode"));
  const start = z.coerce.number().int().min(1).max(150).parse(formData.get("start"));
  const end = z.coerce.number().int().min(1).max(150).parse(formData.get("end"));

  const chapters = getBulkReadChapters(mode, start, end);

  if (chapters.length > 0) {
    await db.insert(tehillimReadLogs).values(
      chapters.map((chapter) => ({
        userId: user.id,
        chapter,
        quantity: 1,
        source: mode,
      })),
    );
  }

  revalidatePath("/tehillim");
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

  revalidatePath("/tehillim");
}
