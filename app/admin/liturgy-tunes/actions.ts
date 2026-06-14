"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  liturgyTunesLinks,
  liturgyTunesParts,
  liturgyTunesTuneParts,
  liturgyTunesTunes,
} from "@/db/schema";
import { requireAdmin } from "@/lib/access";

const linkTypes = ["youtube", "website", "audio", "sheet_music"] as const;

const partSchema = z.object({
  nameEn: z.string().min(1),
  nameHe: z.string().min(1),
  service: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
  parentId: z.string().uuid().optional().or(z.literal("")),
});

const tuneSchema = z.object({
  name: z.string().min(1),
  tradition: z.string().optional(),
  description: z.string().optional(),
  partIds: z.array(z.string().uuid()).default([]),
});

const linkSchema = z.object({
  tuneId: z.string().uuid(),
  url: z.string().url(),
  linkType: z.enum(linkTypes),
  label: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createLiturgyPart(formData: FormData) {
  await requireAdmin();
  const parsed = partSchema.parse({
    nameEn: formData.get("nameEn"),
    nameHe: formData.get("nameHe"),
    service: formData.get("service"),
    sortOrder: formData.get("sortOrder") ?? "0",
    parentId: formData.get("parentId") ?? "",
  });

  await db.insert(liturgyTunesParts).values({
    nameEn: parsed.nameEn,
    nameHe: parsed.nameHe,
    service: parsed.service,
    sortOrder: parsed.sortOrder,
    parentId: parsed.parentId || null,
  });

  revalidatePath("/admin/liturgy-tunes");
}

export async function deleteLiturgyPart(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await db.delete(liturgyTunesParts).where(eq(liturgyTunesParts.id, id));
  revalidatePath("/admin/liturgy-tunes");
}

export async function createLiturgyTune(formData: FormData) {
  const admin = await requireAdmin();
  const partIds = formData
    .getAll("partIds")
    .map((value) => String(value))
    .filter(Boolean);

  const parsed = tuneSchema.parse({
    name: formData.get("name"),
    tradition: formData.get("tradition") ?? undefined,
    description: formData.get("description") ?? undefined,
    partIds,
  });

  const [tune] = await db
    .insert(liturgyTunesTunes)
    .values({
      name: parsed.name,
      tradition: parsed.tradition || null,
      description: parsed.description || null,
      createdById: admin.id,
    })
    .returning({ id: liturgyTunesTunes.id });

  if (parsed.partIds.length > 0) {
    await db.insert(liturgyTunesTuneParts).values(
      parsed.partIds.map((partId) => ({
        tuneId: tune.id,
        partId,
      })),
    );
  }

  revalidatePath("/admin/liturgy-tunes");
  revalidatePath("/liturgy-tunes");
}

export async function deleteLiturgyTune(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await db.delete(liturgyTunesTunes).where(eq(liturgyTunesTunes.id, id));
  revalidatePath("/admin/liturgy-tunes");
  revalidatePath("/liturgy-tunes");
}

export async function createLiturgyLink(formData: FormData) {
  await requireAdmin();
  const parsed = linkSchema.parse({
    tuneId: formData.get("tuneId"),
    url: formData.get("url"),
    linkType: formData.get("linkType"),
    label: formData.get("label") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? "0",
  });

  await db.insert(liturgyTunesLinks).values({
    tuneId: parsed.tuneId,
    url: parsed.url,
    linkType: parsed.linkType,
    label: parsed.label || null,
    sortOrder: parsed.sortOrder,
  });

  revalidatePath("/admin/liturgy-tunes");
  revalidatePath("/liturgy-tunes");
}

export async function deleteLiturgyLink(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await db.delete(liturgyTunesLinks).where(eq(liturgyTunesLinks.id, id));
  revalidatePath("/admin/liturgy-tunes");
  revalidatePath("/liturgy-tunes");
}

export async function updateTuneParts(formData: FormData) {
  await requireAdmin();
  const tuneId = z.string().uuid().parse(formData.get("tuneId"));
  const partIds = formData
    .getAll("partIds")
    .map((value) => String(value))
    .filter(Boolean);

  await db
    .delete(liturgyTunesTuneParts)
    .where(eq(liturgyTunesTuneParts.tuneId, tuneId));

  if (partIds.length > 0) {
    await db.insert(liturgyTunesTuneParts).values(
      partIds.map((partId) => ({
        tuneId,
        partId: z.string().uuid().parse(partId),
      })),
    );
  }

  revalidatePath("/admin/liturgy-tunes");
  revalidatePath("/liturgy-tunes");
}

export async function listLiturgyAdminData() {
  await requireAdmin();

  const [parts, tunes, tuneParts, links] = await Promise.all([
    db.select().from(liturgyTunesParts).orderBy(liturgyTunesParts.sortOrder),
    db.select().from(liturgyTunesTunes).orderBy(liturgyTunesTunes.name),
    db.select().from(liturgyTunesTuneParts),
    db.select().from(liturgyTunesLinks).orderBy(liturgyTunesLinks.sortOrder),
  ]);

  const partsByTune = new Map<string, string[]>();
  for (const entry of tuneParts) {
    const current = partsByTune.get(entry.tuneId) ?? [];
    current.push(entry.partId);
    partsByTune.set(entry.tuneId, current);
  }

  const linksByTune = new Map<string, typeof links>();
  for (const link of links) {
    const current = linksByTune.get(link.tuneId) ?? [];
    current.push(link);
    linksByTune.set(link.tuneId, current);
  }

  return { parts, tunes, partsByTune, linksByTune };
}
