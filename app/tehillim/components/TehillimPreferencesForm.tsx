import { updateTehillimPreferences } from "../actions";

type TehillimPreferencesFormProps = {
  preferences: {
    fontFamily: string;
    fontSize: number;
    showKamatzKatan: boolean;
    showEnglish: boolean;
    showTeamim: boolean;
    darkMode: boolean;
  };
};

export function TehillimPreferencesForm({ preferences }: TehillimPreferencesFormProps) {
  return (
    <section className="tehillim-card rounded-xl p-4">
      <h2 className="mb-3 text-right text-lg font-semibold">העדפות תצוגה</h2>
      <form action={updateTehillimPreferences} className="space-y-3">
        <select
          name="fontFamily"
          defaultValue={preferences.fontFamily}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="system-hebrew">גופן עברי סריף</option>
          <option value="large-clear">גופן גדול וברור</option>
          <option value="sbl">גופן SBL</option>
        </select>
        <input type="hidden" name="fontSize" value={preferences.fontSize} />
        <label className="flex items-center justify-end gap-2 text-sm">
          הצג תרגום באנגלית
          <input
            name="showEnglish"
            type="checkbox"
            defaultChecked={preferences.showEnglish}
          />
        </label>
        <label className="flex items-center justify-end gap-2 text-sm">
          הצג טעמי מקרא
          <input
            name="showTeamim"
            type="checkbox"
            defaultChecked={preferences.showTeamim}
          />
        </label>
        <label className="flex items-center justify-end gap-2 text-sm">
          סמן קמץ קטן
          <input
            name="showKamatzKatan"
            type="checkbox"
            defaultChecked={preferences.showKamatzKatan}
          />
        </label>
        <input type="hidden" name="darkMode" value={preferences.darkMode ? "on" : "off"} />
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          שמור העדפות
        </button>
      </form>
    </section>
  );
}
