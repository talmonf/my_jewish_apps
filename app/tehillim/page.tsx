import Link from "next/link";

import { requireAppAccess } from "@/lib/access";
import { getChaptersForMonthDay, getChaptersForWeekday } from "@/lib/tehillim/bulk";
import { getGregorianWeekday, formatHebrewDate, getHebrewDayOfMonth } from "@/lib/tehillim/hebrew-calendar";
import { getTehillimUserData } from "@/lib/tehillim/queries";

import { PreferencesFooter } from "./components/PreferencesFooter";
import { TehillimHeader } from "./components/TehillimHeader";
import { TehillimPreferencesForm } from "./components/TehillimPreferencesForm";

const WEEKDAYS = [
  { day: 7, label: "שבת" },
  { day: 1, label: "ראשון" },
  { day: 2, label: "שני" },
  { day: 3, label: "שלישי" },
  { day: 4, label: "רביעי" },
  { day: 5, label: "חמישי" },
  { day: 6, label: "שישי" },
];

export default async function TehillimHomePage() {
  const user = await requireAppAccess("tehillim");
  const { preferences, favoriteChapters } = await getTehillimUserData(user.id);
  const hebrewDate = formatHebrewDate();
  const monthDay = getHebrewDayOfMonth();
  const weekday = getGregorianWeekday();
  const todayChapters = getChaptersForMonthDay(monthDay);
  const firstTodayChapter = todayChapters[0] ?? 1;

  return (
    <div className={preferences.darkMode ? "tehillim-shell tehillim-dark" : "tehillim-shell"}>
      <TehillimHeader title="תהילים" backHref="/" backLabel="אפליקציות" />

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-28 pt-4">
        <section className="tehillim-card rounded-xl p-4">
          <h2 className="mb-3 text-right text-lg font-semibold">סימניות שלי</h2>
          <Link
            href="/tehillim/bookmarks"
            className="tehillim-btn block text-center"
          >
            ♥ סימניות שסימנתי ({favoriteChapters.size})
          </Link>
        </section>

        <section className="tehillim-card rounded-xl p-4">
          <h2 className="mb-3 text-right text-lg font-semibold">תהילים</h2>
          <div className="space-y-2">
            <Link href="/tehillim/chapters" className="tehillim-btn block text-center">
              תהילים לפי פרק
            </Link>
            <Link
              href={`/tehillim/chapter?chapter=${firstTodayChapter}`}
              className="tehillim-btn block text-center"
            >
              תהילים ל{hebrewDate}
            </Link>
            {WEEKDAYS.map((entry) => {
              const chapters = getChaptersForWeekday(entry.day);
              const first = chapters[0] ?? 1;
              return (
                <Link
                  key={entry.day}
                  href={`/tehillim/chapter?chapter=${first}&weekday=${entry.day}`}
                  className="tehillim-btn block text-center"
                >
                  ליום {entry.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="tehillim-card rounded-xl p-4">
          <h2 className="mb-3 text-right text-lg font-semibold">מעקב קריאה</h2>
          <Link href="/tehillim/audit" className="tehillim-btn block text-center">
            יומן קריאות
          </Link>
        </section>

        <TehillimPreferencesForm preferences={preferences} />

        <p className="text-center text-xs text-slate-500">
          טקסט ספר התהילים באדיבות J. Alan Groves Center בכפוף לרישיון CC-2.5
        </p>
      </main>

      <PreferencesFooter
        fontSize={preferences.fontSize}
        darkMode={preferences.darkMode}
      />
    </div>
  );
}
