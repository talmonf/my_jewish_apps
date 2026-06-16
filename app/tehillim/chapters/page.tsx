import Link from "next/link";

import { requireAppAccess } from "@/lib/access";
import { TEHILLIM_CHAPTERS } from "@/lib/tehillim/metadata";
import { toHebrewNumeral } from "@/lib/tehillim/gematria";
import { getTehillimUserData } from "@/lib/tehillim/queries";

import { PreferencesFooter } from "../components/PreferencesFooter";
import { TehillimHeader } from "../components/TehillimHeader";

export default async function TehillimChaptersPage() {
  const user = await requireAppAccess("tehillim");
  const { preferences, favoriteChapters } = await getTehillimUserData(user.id);

  return (
    <div className={preferences.darkMode ? "tehillim-shell tehillim-dark" : "tehillim-shell"}>
      <TehillimHeader title="בחר פרק" />

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        <div className="grid grid-cols-4 gap-2">
          {TEHILLIM_CHAPTERS.map((entry) => (
            <Link
              key={entry.chapter}
              href={`/tehillim/chapter?chapter=${entry.chapter}`}
              className={`tehillim-btn py-4 text-center text-lg font-semibold ${
                favoriteChapters.has(entry.chapter) ? "ring-2 ring-rose-400" : ""
              }`}
            >
              {toHebrewNumeral(entry.chapter)}
            </Link>
          ))}
        </div>
      </main>

      <PreferencesFooter
        fontSize={preferences.fontSize}
        darkMode={preferences.darkMode}
      />
    </div>
  );
}
