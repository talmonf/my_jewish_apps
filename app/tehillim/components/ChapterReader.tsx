import type { TehillimToken } from "@/db/schema";
import { toHebrewNumeral, toHebrewVerseLabel } from "@/lib/tehillim/gematria";
import { fontFamilyClass } from "@/lib/tehillim/preferences";
import { normalizeSefariaText } from "@/lib/tehillim/sefaria";
import { annotateSuperscriptionTokens } from "@/lib/tehillim/superscription";

import { markChapterRead, toggleFavorite } from "../actions";
import { PreferencesFooter } from "./PreferencesFooter";
import { SelectableVerseText } from "./SelectableVerseText";
import { ShareButton } from "./ShareButton";
import { TehillimHeader } from "./TehillimHeader";
import { TehillimPreferencesForm } from "./TehillimPreferencesForm";

type Verse = {
  id: string;
  verse: number;
  hebrew: string;
  english: string | null;
  tokens: TehillimToken[] | null;
};

type ChapterReaderProps = {
  chapter: number;
  meta: {
    book: number;
    dayOfWeek: number;
    dayOfMonth: number;
    title: string;
  };
  verses: Verse[];
  comments: Array<{ id: string; verse: number; marker: string; comment: string }>;
  highlights: Array<{
    id: string;
    startVerse: number;
    endVerse: number;
    startWord: number | null;
    endWord: number | null;
  }>;
  phraseBreaks: Array<{ verse: number; afterWordIndex: number; breakType: string }>;
  preferences: {
    fontFamily: string;
    fontSize: number;
    darkMode: boolean;
    showKamatzKatan: boolean;
    showEnglish: boolean;
    showTeamim: boolean;
  };
  isFavorite: boolean;
  readCount: number;
};

export function ChapterReader({
  chapter,
  meta,
  verses,
  comments,
  highlights,
  phraseBreaks,
  preferences,
  isFavorite,
  readCount,
}: ChapterReaderProps) {
  const fontClass = fontFamilyClass(preferences.fontFamily);
  const shareText = `תהילים פרק ${toHebrewNumeral(chapter)}`;

  return (
    <div className={preferences.darkMode ? "tehillim-dark" : ""}>
      <TehillimHeader title={`פרק - ${toHebrewNumeral(chapter)}`} backHref="/tehillim/chapters" />

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        <section className="tehillim-card rounded-xl p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex gap-2">
              <ShareButton title={shareText} text={shareText} />
              <form action={toggleFavorite}>
                <input type="hidden" name="chapter" value={chapter} />
                <input type="hidden" name="isFavorite" value={String(isFavorite)} />
                <button
                  type="submit"
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    isFavorite
                      ? "bg-rose-500 text-white"
                      : "border border-slate-300 text-slate-700"
                  }`}
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
              </form>
            </div>
            <p className="text-4xl font-bold">{toHebrewNumeral(chapter)}</p>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
            <div className="text-sm text-slate-600">
              <p>
                ספר {meta.book} · יום {meta.dayOfWeek} בשבוע · יום {meta.dayOfMonth} בחודש
              </p>
              <p className="mt-1 font-medium text-slate-800">
                נקרא {readCount} פעמים
              </p>
            </div>
            <form action={markChapterRead}>
              <input type="hidden" name="chapter" value={chapter} />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
              >
                סימנתי שקראתי
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {verses.length > 0 ? (
              verses.map((verse) => {
                const hebrew = normalizeSefariaText(verse.hebrew);
                const tokens =
                  verse.tokens ?? annotateSuperscriptionTokens(hebrew, verse.verse);
                const verseComments = comments.filter(
                  (comment) => comment.verse === verse.verse,
                );
                const versePhraseBreaks = phraseBreaks.filter(
                  (entry) => entry.verse === verse.verse,
                );

                return (
                  <article key={verse.id} className="border-b border-slate-100 pb-5 last:border-0">
                    <div className="mb-2 flex items-start gap-3">
                      <div className="flex-1">
                        <SelectableVerseText
                          chapter={chapter}
                          verse={verse.verse}
                          tokens={tokens}
                          highlights={highlights}
                          phraseBreaks={versePhraseBreaks}
                          showKamatzKatan={preferences.showKamatzKatan}
                          showTeamim={preferences.showTeamim}
                          fontClass={fontClass}
                          fontSize={preferences.fontSize}
                        />
                        {preferences.showEnglish && verse.english ? (
                          <p className="mt-2 text-left text-sm text-slate-600 ltr:dir-ltr">
                            {normalizeSefariaText(verse.english)}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-sm font-semibold text-slate-400">
                        {toHebrewVerseLabel(verse.verse)}
                      </span>
                    </div>
                    {verseComments.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {verseComments.map((comment, index) => (
                          <details key={comment.id} className="text-sm">
                            <summary className="cursor-pointer text-sky-700">
                              {comment.marker}
                              {index + 1} הערה
                            </summary>
                            <p className="mt-1 text-slate-700">{comment.comment}</p>
                          </details>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <p className="rounded-lg bg-amber-50 p-4 text-amber-900">
                אין טקסט מקומי לפרק זה. הרץ את סקריפט הייבוא מספריה.
              </p>
            )}
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          טקסט ספר התהילים באדיבות J. Alan Groves Center בכפוף לרישיון CC-2.5
        </p>

        <div className="mt-4">
          <TehillimPreferencesForm preferences={preferences} />
        </div>
      </main>

      <PreferencesFooter
        fontSize={preferences.fontSize}
        darkMode={preferences.darkMode}
      />
    </div>
  );
}
