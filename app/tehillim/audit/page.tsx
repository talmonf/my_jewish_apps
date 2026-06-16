import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { tehillimReadSessions } from "@/db/schema";
import { requireAppAccess } from "@/lib/access";
import { getTehillimUserData } from "@/lib/tehillim/queries";

import { bulkMarkRead } from "../actions";
import { PreferencesFooter } from "../components/PreferencesFooter";
import { TehillimHeader } from "../components/TehillimHeader";

export default async function TehillimAuditPage() {
  const user = await requireAppAccess("tehillim");
  const { preferences } = await getTehillimUserData(user.id);

  const sessions = await db
    .select()
    .from(tehillimReadSessions)
    .where(eq(tehillimReadSessions.userId, user.id))
    .orderBy(desc(tehillimReadSessions.reportedAt));

  return (
    <div className={preferences.darkMode ? "tehillim-shell tehillim-dark" : "tehillim-shell"}>
      <TehillimHeader title="יומן קריאות" />

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-28 pt-4">
        <section className="tehillim-card rounded-xl p-4">
          <h2 className="mb-3 text-right text-lg font-semibold">דווח קריאה מרוכזת</h2>
          <form action={bulkMarkRead} className="space-y-3">
            <select
              name="mode"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              defaultValue="range"
            >
              <option value="range">טווח פרקים</option>
              <option value="book">ספר</option>
              <option value="weekday">יום בשבוע</option>
              <option value="month">ימים בחודש</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="start"
                type="number"
                min={1}
                max={150}
                defaultValue={1}
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="מ"
              />
              <input
                name="end"
                type="number"
                min={1}
                max={150}
                defaultValue={1}
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="עד"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
            >
              סימנתי שקראתי
            </button>
          </form>
        </section>

        <section className="space-y-2">
          <h2 className="text-right text-lg font-semibold">היסטוריה</h2>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <article
                key={session.id}
                className="tehillim-card flex items-center justify-between rounded-xl px-4 py-3"
              >
                <time className="text-sm text-slate-500">
                  {new Intl.DateTimeFormat("he-IL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(session.reportedAt)}
                </time>
                <p className="font-medium">{session.label}</p>
              </article>
            ))
          ) : (
            <p className="tehillim-card rounded-xl p-4 text-center text-slate-600">
              אין דיווחי קריאה עדיין.
            </p>
          )}
        </section>
      </main>

      <PreferencesFooter
        fontSize={preferences.fontSize}
        darkMode={preferences.darkMode}
      />
    </div>
  );
}
