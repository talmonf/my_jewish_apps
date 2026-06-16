import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { tehillimFavorites } from "@/db/schema";
import { requireAppAccess } from "@/lib/access";
import { toHebrewNumeral } from "@/lib/tehillim/gematria";
import { getTehillimUserData } from "@/lib/tehillim/queries";

import { removeFavorite } from "../actions";
import { PreferencesFooter } from "../components/PreferencesFooter";
import { TehillimHeader } from "../components/TehillimHeader";

export default async function TehillimBookmarksPage() {
  const user = await requireAppAccess("tehillim");
  const { preferences } = await getTehillimUserData(user.id);

  const favorites = await db
    .select()
    .from(tehillimFavorites)
    .where(eq(tehillimFavorites.userId, user.id))
    .orderBy(desc(tehillimFavorites.createdAt));

  const chapters = favorites.map((entry) => entry.chapter);
  const showAllHref =
    chapters.length > 0
      ? `/tehillim/chapter?chapter=${chapters[0]}`
      : "/tehillim/chapters";

  return (
    <div className={preferences.darkMode ? "tehillim-shell tehillim-dark" : "tehillim-shell"}>
      <TehillimHeader title="הסימניות שסימנתי" />

      <main className="mx-auto max-w-3xl space-y-3 px-4 pb-28 pt-4">
        <Link
          href={showAllHref}
          className="tehillim-card flex items-center justify-between rounded-xl px-4 py-3"
        >
          <span aria-hidden>▶</span>
          <span>הצג את כל הסימניות</span>
        </Link>

        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div
              key={favorite.chapter}
              className="tehillim-card flex items-center justify-between rounded-xl px-4 py-3"
            >
              <form action={removeFavorite}>
                <input type="hidden" name="chapter" value={favorite.chapter} />
                <button
                  type="submit"
                  className="rounded bg-rose-500 px-3 py-2 text-white"
                  aria-label="הסר סימניה"
                >
                  ✕
                </button>
              </form>
              <Link
                href={`/tehillim/chapter?chapter=${favorite.chapter}`}
                className="text-2xl font-bold"
              >
                {toHebrewNumeral(favorite.chapter)}
              </Link>
            </div>
          ))
        ) : (
          <p className="tehillim-card rounded-xl p-4 text-center text-slate-600">
            אין סימניות עדיין.
          </p>
        )}
      </main>

      <PreferencesFooter
        fontSize={preferences.fontSize}
        darkMode={preferences.darkMode}
      />
    </div>
  );
}
