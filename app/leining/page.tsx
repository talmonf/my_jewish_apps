import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  leiningAnalysisResults,
  leiningAssignments,
  leiningReferenceRecordings,
  leiningSections,
  leiningStudentSubmissions,
} from "@/db/schema";
import { requireAppAccess } from "@/lib/access";

import { createLeiningAssignment, submitLeiningRecording } from "./actions";

export default async function LeiningPage() {
  const user = await requireAppAccess("leining");
  const canTeach = ["admin", "teacher"].includes(user.role);

  const [assignments, references, submissions, results] = await Promise.all([
    db
      .select({
        id: leiningAssignments.id,
        title: leiningAssignments.title,
        instructions: leiningAssignments.instructions,
        teacherId: leiningAssignments.teacherId,
        studentId: leiningAssignments.studentId,
        createdAt: leiningAssignments.createdAt,
        sectionTitle: leiningSections.title,
        book: leiningSections.book,
        startRef: leiningSections.startRef,
        endRef: leiningSections.endRef,
        expectedText: leiningSections.expectedText,
      })
      .from(leiningAssignments)
      .innerJoin(
        leiningSections,
        eq(leiningSections.id, leiningAssignments.sectionId),
      )
      .orderBy(desc(leiningAssignments.createdAt)),
    db.select().from(leiningReferenceRecordings),
    db
      .select()
      .from(leiningStudentSubmissions)
      .orderBy(desc(leiningStudentSubmissions.createdAt)),
    db.select().from(leiningAnalysisResults),
  ]);

  const referenceByAssignment = new Map(
    references.map((reference) => [reference.assignmentId, reference]),
  );
  const submissionsByAssignment = new Map<string, typeof submissions>();

  for (const submission of submissions) {
    const current = submissionsByAssignment.get(submission.assignmentId) ?? [];
    current.push(submission);
    submissionsByAssignment.set(submission.assignmentId, current);
  }

  const resultBySubmission = new Map(
    results.map((result) => [result.submissionId, result]),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link href="/" className="text-sm font-medium text-sky-700">
        Back to apps
      </Link>
      <header className="mt-2">
        <h1 className="text-3xl font-bold">Leining Practice</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Teachers create sections with reference recordings. Students upload
          leining attempts and receive AI-assisted correction results.
        </p>
      </header>

      {canTeach ? (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold">Create assignment</h2>
          <form action={createLeiningAssignment} className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="title"
                placeholder="Assignment title"
                required
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                name="studentEmail"
                type="email"
                placeholder="Optional student email"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                name="book"
                placeholder="Book"
                required
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                name="startRef"
                placeholder="Start ref"
                required
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                name="endRef"
                placeholder="End ref"
                required
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <input
              name="referenceAudioUrl"
              type="url"
              placeholder="Teacher reference audio URL"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <textarea
              name="expectedText"
              required
              placeholder="Expected Hebrew text"
              className="min-h-28 rounded-lg border border-slate-300 px-3 py-2"
            />
            <textarea
              name="instructions"
              placeholder="Practice instructions"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <button className="w-fit rounded-lg bg-slate-950 px-4 py-2 font-medium text-white">
              Create assignment
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-semibold">Assignments</h2>
        {assignments.map((assignment) => {
          const reference = referenceByAssignment.get(assignment.id);
          const assignmentSubmissions =
            submissionsByAssignment.get(assignment.id) ?? [];

          return (
            <article
              key={assignment.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div>
                  <p className="text-sm text-slate-600">
                    {assignment.book} {assignment.startRef} - {assignment.endRef}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    {assignment.title}
                  </h3>
                  {assignment.instructions ? (
                    <p className="mt-2 text-slate-600">
                      {assignment.instructions}
                    </p>
                  ) : null}
                  <p className="hebrew-text mt-4 rounded-xl bg-slate-50 p-4 text-2xl">
                    {assignment.expectedText}
                  </p>
                  {reference ? (
                    <a
                      href={reference.audioUrl}
                      className="mt-3 inline-block text-sm font-medium text-sky-700"
                    >
                      Teacher reference recording
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-amber-700">
                      No reference recording yet.
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <h4 className="font-semibold">Submit your leining</h4>
                  <form action={submitLeiningRecording} className="mt-3 space-y-3">
                    <input
                      type="hidden"
                      name="assignmentId"
                      value={assignment.id}
                    />
                    <input
                      name="audioUrl"
                      type="url"
                      required
                      placeholder="Student audio URL"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                    <textarea
                      name="transcript"
                      placeholder="Optional transcript for initial alignment"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                    <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white">
                      Upload and analyze
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold">Submissions and analysis</h4>
                <div className="mt-3 space-y-3">
                  {assignmentSubmissions.length > 0 ? (
                    assignmentSubmissions.map((submission) => {
                      const result = resultBySubmission.get(submission.id);

                      return (
                        <div
                          key={submission.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <a
                              href={submission.audioUrl}
                              className="font-medium text-sky-700"
                            >
                              Student recording
                            </a>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                              {submission.status}
                            </span>
                          </div>
                          {result ? (
                            <div className="mt-3">
                              <p className="text-sm text-slate-600">
                                Provider: {result.provider} · Confidence:{" "}
                                {result.confidence}%
                              </p>
                              <ul className="mt-2 space-y-2">
                                {result.issues.map((issue, index) => (
                                  <li
                                    key={`${submission.id}-${index}`}
                                    className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950"
                                  >
                                    <strong>{issue.type}:</strong> {issue.note}
                                    {issue.expected ? ` Expected: ${issue.expected}` : ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-600">
                      No student submissions yet.
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
