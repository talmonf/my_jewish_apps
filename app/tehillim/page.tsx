import Link from "next/link";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  tehillimChapters,
  tehillimComments,
  tehillimFavorites,
  tehillimHighlights,
  tehillimReadLogs,
  tehillimUserPreferences,
  tehillimVerses,
} from "@/db/schema";
import { requireAppAccess } from "@/lib/access";
import { TEHILLIM_CHAPTERS } from "@/lib/tehillim/metadata";

import {
  addComment,
  addHighlight,
  bulkMarkRead,
  markChapterRead,
  toggleFavorite,
  updateTehillimPreferences,
} from "./actions";

type PageProps = {
  searchParams?: Promise<{ chapter?: string }>;
};

export default async function TehillimPage({ searchParams }: PageProps) {
  const user = await requireAppAccess("tehillim");
  const params = await searchParams;
  const selectedChapter = Math.min(
    150,
    Math.max(1, Number(params?.chapter ?? 1) || 1),
  );

  const [
    [chapter],
    verses,
    [preferences],
    favorites,
    comments,
    highlights,
    readLogs,
  ] = await Promise.all([
    db
      .select()
      .from(tehillimChapters)
      .where(eq(tehillimChapters.chapter, selectedChapter))
      .limit(1),
    db
      .select()
      .from(tehillimVerses)
      .where(eq(tehillimVerses.chapter, selectedChapter))
      .orderBy(tehillimVerses.verse),
    db
      .select()
      .from(tehillimUserPreferences)
      .where(eq(tehillimUserPreferences.userId, user.id))
      .limit(1),
    db
      .select()
      .from(tehillimFavorites)
      .where(eq(tehillimFavorites.userId, user.id)),
    db
      .select()
      .from(tehillimComments)
      .where(
        and(
          eq(tehillimComments.userId, user.id),
          eq(tehillimComments.chapter, selectedChapter),
        ),
      ),
    db
      .select()
      .from(tehillimHighlights)
      .where(
        and(
          eq(tehillimHighlights.userId, user.id),
          eq(tehillimHighlights.chapter, selectedChapter),
        ),
      ),
    db
      .select()
      .from(tehillimReadLogs)
      .where(eq(tehillimReadLogs.userId, user.id)),
  ]);

  const fallbackMeta = TEHILLIM_CHAPTERS[selectedChapter - 1];
  const meta = chapter ?? fallbackMeta;
  const favoriteChapters = new Set(favorites.map((entry) => entry.chapter));
  const isFavorite = favoriteChapters.has(selectedChapter);
  const readCounts = readLogs.reduce<Record<number, number>>((acc, log) => {
    acc[log.chapter] = (acc[log.chapter] ?? 0) + log.quantity;
    return acc;
  }, {});

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-6">
        <Link href="/" className="text-sm font-medium text-sky-700">
          Back to apps
        </Link>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold">Preferences</h2>
          <form action={updateTehillimPreferences} className="mt-4 space-y-3">
            <select
              name="fontFamily"
              defaultValue={preferences?.fontFamily ?? "system-hebrew"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="system-hebrew">System Hebrew serif</option>
              <option value="large-clear">Large clear font</option>
              <option value="sbl">SBL-style Hebrew</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="showKamatzKatan"
                type="checkbox"
                defaultChecked={preferences?.showKamatzKatan ?? true}
              />
              Indicate kamatz katan
            </label>
            <button className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white">
              Save preferences
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold">Chapters</h2>
          <div className="mt-3 grid grid-cols-5 gap-2 text-sm">
            {TEHILLIM_CHAPTERS.map((entry) => (
              <Link
                key={entry.chapter}
                href={`/tehillim?chapter=${entry.chapter}`}
                className={`rounded-lg px-2 py-1 text-center ${
                  entry.chapter === selectedChapter
                    ? "bg-slate-950 text-white"
                    : favoriteChapters.has(entry.chapter)
                      ? "bg-amber-100 text-amber-950"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {entry.chapter}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold">Bulk read report</h2>
          <form action={bulkMarkRead} className="mt-4 space-y-3">
            <select
              name="mode"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              defaultValue="range"
            >
              <option value="range">Chapter range</option>
              <option value="weekday">Day of week</option>
              <option value="month">Day of month</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="start"
                type="number"
                min={1}
                max={150}
                defaultValue={selectedChapter}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                name="end"
                type="number"
                min={1}
                max={150}
                defaultValue={selectedChapter}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <button className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white">
              Mark bulk read
            </button>
          </form>
        </section>
      </aside>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">
              Book {meta.book} · Weekday division {meta.dayOfWeek} · Month day{" "}
              {meta.dayOfMonth}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{meta.title}</h1>
            <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sky-900">
              Author: {meta.author}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={toggleFavorite}>
              <input type="hidden" name="chapter" value={selectedChapter} />
              <input
                type="hidden"
                name="isFavorite"
                value={String(isFavorite)}
              />
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">
                {isFavorite ? "Clear favorite" : "Favorite"}
              </button>
            </form>
            <form action={markChapterRead}>
              <input type="hidden" name="chapter" value={selectedChapter} />
              <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white">
                Mark read ({readCounts[selectedChapter] ?? 0})
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {verses.length > 0 ? (
            verses.map((verse) => {
              const verseComments = comments.filter(
                (comment) => comment.verse === verse.verse,
              );
              const isHighlighted = highlights.some(
                (highlight) =>
                  verse.verse >= highlight.startVerse &&
                  verse.verse <= highlight.endVerse,
              );

              return (
                <article
                  key={verse.id}
                  className={`rounded-xl p-4 ${
                    isHighlighted ? "bg-yellow-50" : "bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-500">
                    Verse {verse.verse}
                  </p>
                  <p className="hebrew-text mt-2 text-3xl">{verse.hebrew}</p>
                  {verse.english ? (
                    <p className="mt-2 text-slate-600">{verse.english}</p>
                  ) : null}
                  {verseComments.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {verseComments.map((comment, index) => (
                        <details key={comment.id}>
                          <summary className="cursor-pointer text-sm font-medium text-sky-700">
                            {comment.marker}
                            {index + 1} Comment
                          </summary>
                          <p className="mt-1 text-sm text-slate-700">
                            {comment.comment}
                          </p>
                        </details>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <p className="rounded-xl bg-amber-50 p-4 text-amber-900">
              No local text is loaded for this chapter yet. Run the Sefaria
              import script after configuring the database.
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <form action={addComment} className="rounded-xl bg-slate-50 p-4">
            <h2 className="font-semibold">Add comment</h2>
            <input type="hidden" name="chapter" value={selectedChapter} />
            <input
              name="verse"
              type="number"
              min={1}
              defaultValue={1}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <textarea
              name="comment"
              required
              placeholder="Your comment"
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <button className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white">
              Save comment
            </button>
          </form>

          <form action={addHighlight} className="rounded-xl bg-slate-50 p-4">
            <h2 className="font-semibold">Highlight verses</h2>
            <input type="hidden" name="chapter" value={selectedChapter} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                name="startVerse"
                type="number"
                min={1}
                defaultValue={1}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                name="endVerse"
                type="number"
                min={1}
                defaultValue={1}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <button className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white">
              Save highlight
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
