"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  liturgyTunesParts,
  liturgyTunesSearchRequests,
  liturgyTunesSearchResults,
} from "@/db/schema";
import { requireAppAccess } from "@/lib/access";
import { searchInternetForTune } from "@/lib/liturgy-tunes/searcher";
import { transcribeAudio } from "@/lib/liturgy-tunes/transcribe";

const searchSchema = z.object({
  liturgyText: z.string().min(1),
  audioUrl: z.string().url().optional().or(z.literal("")),
  partId: z.string().uuid().optional().or(z.literal("")),
  tradition: z.string().optional(),
});

export async function submitTuneSearch(formData: FormData) {
  const user = await requireAppAccess("liturgy-tunes");

  const parsed = searchSchema.parse({
    liturgyText: formData.get("liturgyText"),
    audioUrl: formData.get("audioUrl") ?? "",
    partId: formData.get("partId") ?? "",
    tradition: formData.get("tradition") ?? undefined,
  });

  const audioUrl = parsed.audioUrl || undefined;
  const partId = parsed.partId || undefined;

  const [request] = await db
    .insert(liturgyTunesSearchRequests)
    .values({
      userId: user.id,
      liturgyText: parsed.liturgyText,
      audioUrl: audioUrl ?? null,
      partId: partId ?? null,
      tradition: parsed.tradition || null,
      status: "searching",
    })
    .returning({ id: liturgyTunesSearchRequests.id });

  try {
    let transcript: string | null = null;
    if (audioUrl) {
      try {
        transcript = await transcribeAudio(audioUrl);
      } catch {
        transcript = null;
      }
    }

    let partNameEn: string | undefined;
    let partNameHe: string | undefined;
    if (partId) {
      const [part] = await db
        .select()
        .from(liturgyTunesParts)
        .where(eq(liturgyTunesParts.id, partId))
        .limit(1);
      partNameEn = part?.nameEn;
      partNameHe = part?.nameHe;
    }

    const searchOutput = await searchInternetForTune({
      liturgyText: parsed.liturgyText,
      transcript: transcript ?? undefined,
      partNameEn,
      partNameHe,
      tradition: parsed.tradition,
      audioUrl,
    });

    await db
      .update(liturgyTunesSearchRequests)
      .set({
        transcript,
        status: "completed",
      })
      .where(eq(liturgyTunesSearchRequests.id, request.id));

    await db.insert(liturgyTunesSearchResults).values({
      requestId: request.id,
      provider: searchOutput.provider,
      results: searchOutput.results,
    });

    revalidatePath("/liturgy-tunes");
  } catch (error) {
    await db
      .update(liturgyTunesSearchRequests)
      .set({ status: "failed" })
      .where(eq(liturgyTunesSearchRequests.id, request.id));

    throw error;
  }
}
