"use client";

import { useTransition } from "react";

import { adjustFontSize, toggleDarkMode } from "../actions";
import { AudioPlaceholder } from "./AudioPlaceholder";

type PreferencesFooterProps = {
  fontSize: number;
  darkMode: boolean;
};

export function PreferencesFooter({ fontSize, darkMode }: PreferencesFooterProps) {
  const [pending, startTransition] = useTransition();

  return (
    <footer className="tehillim-card fixed inset-x-0 bottom-0 z-20 border-t px-4 py-3">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <AudioPlaceholder />
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => adjustFontSize(-10))}
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            aria-label="הקטן גופן"
          >
            א−
          </button>
          <span className="text-xs text-slate-500">{fontSize}%</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => adjustFontSize(10))}
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            aria-label="הגדל גופן"
          >
            א+
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleDarkMode())}
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            aria-label="מצב לילה"
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </footer>
  );
}
