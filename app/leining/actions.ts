"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  leiningAnalysisResults,
  leiningAssignments,
  leiningReferenceRecordings,
  leiningSections,
  leiningStudentSubmissions,
  users,
} from "@/db/schema";
import { requireAppAccess } from "@/lib/access";
import { analyzeLeiningSubmission } from "@/lib/leining/analyzer";

const assignmentSchema = z.object({
  title: z.string().min(2),
  book: z.string().min(1),
  startRef: z.string().min(1),
  endRef: z.string().min(1),
  expectedText: z.string().min(1),
  instructions: z.string().optional(),
  referenceAudioUrl: z.string().url().optional().or(z.literal("")),
  studentEmail: z.string().email().optional().or(z.literal("")),
});

export async function createLeiningAssignment(formData: FormData) {
  const teacher = await requireAppAccess("leining");

  if (!["admin", "teacher"].includes(teacher.role)) {
    throw new Error("Only teachers and admins can create assignments.");
  }

  const parsed = assignmentSchema.parse({
    title: formData.get("title"),
    book: formData.get("book"),
    startRef: formData.get("startRef"),
    endRef: formData.get("endRef"),
    expectedText: formData.get("expectedText"),
    instructions: formData.get("instructions")?.toString(),
    referenceAudioUrl: formData.get("referenceAudioUrl")?.toString(),
    studentEmail: formData.get("studentEmail")?.toString(),
  });

  const [student] = parsed.studentEmail
    ? await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, parsed.studentEmail.toLowerCase()))
        .limit(1)
    : [];

  const [section] = await db
    .insert(leiningSections)
    .values({
      title: parsed.title,
      book: parsed.book,
      startRef: parsed.startRef,
      endRef: parsed.endRef,
      expectedText: parsed.expectedText,
      createdById: teacher.id,
    })
    .returning({ id: leiningSections.id });

  const [assignment] = await db
    .insert(leiningAssignments)
    .values({
      sectionId: section.id,
      teacherId: teacher.id,
      studentId: student?.id,
      title: parsed.title,
      instructions: parsed.instructions,
    })
    .returning({ id: leiningAssignments.id });

  if (parsed.referenceAudioUrl) {
    await db.insert(leiningReferenceRecordings).values({
      assignmentId: assignment.id,
      teacherId: teacher.id,
      audioUrl: parsed.referenceAudioUrl,
    });
  }

  revalidatePath("/leining");
}

export async function submitLeiningRecording(formData: FormData) {
  const student = await requireAppAccess("leining");
  const assignmentId = z.string().uuid().parse(formData.get("assignmentId"));
  const audioUrl = z.string().url().parse(formData.get("audioUrl"));
  const transcript = z.string().optional().parse(formData.get("transcript") ?? "");

  const [assignment] = await db
    .select({
      id: leiningAssignments.id,
      sectionId: leiningAssignments.sectionId,
    })
    .from(leiningAssignments)
    .where(eq(leiningAssignments.id, assignmentId))
    .limit(1);

  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  const [section] = await db
    .select()
    .from(leiningSections)
    .where(eq(leiningSections.id, assignment.sectionId))
    .limit(1);

  const [reference] = await db
    .select()
    .from(leiningReferenceRecordings)
    .where(eq(leiningReferenceRecordings.assignmentId, assignment.id))
    .limit(1);

  const [submission] = await db
    .insert(leiningStudentSubmissions)
    .values({
      assignmentId: assignment.id,
      studentId: student.id,
      audioUrl,
      status: "processing",
    })
    .returning({ id: leiningStudentSubmissions.id });

  const analysis = await analyzeLeiningSubmission({
    expectedText: section.expectedText,
    referenceAudioUrl: reference?.audioUrl,
    studentAudioUrl: audioUrl,
    transcript,
  });

  await db.insert(leiningAnalysisResults).values({
    submissionId: submission.id,
    provider: analysis.provider,
    confidence: analysis.confidence,
    issues: analysis.issues,
  });

  await db
    .update(leiningStudentSubmissions)
    .set({ status: "analyzed" })
    .where(eq(leiningStudentSubmissions.id, submission.id));

  revalidatePath("/leining");
}
