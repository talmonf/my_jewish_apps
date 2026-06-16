import type { tehillimUserPreferences } from "@/db/schema";

export type TehillimPreferences = {
  fontFamily: string;
  fontSize: number;
  darkMode: boolean;
  showKamatzKatan: boolean;
  showEnglish: boolean;
  showTeamim: boolean;
};

export const DEFAULT_TEHILLIM_PREFERENCES: TehillimPreferences = {
  fontFamily: "system-hebrew",
  fontSize: 100,
  darkMode: false,
  showKamatzKatan: true,
  showEnglish: false,
  showTeamim: true,
};

export function resolveTehillimPreferences(
  row?: typeof tehillimUserPreferences.$inferSelect | null,
): TehillimPreferences {
  return {
    fontFamily: row?.fontFamily ?? DEFAULT_TEHILLIM_PREFERENCES.fontFamily,
    fontSize: row?.fontSize ?? DEFAULT_TEHILLIM_PREFERENCES.fontSize,
    darkMode: row?.darkMode ?? DEFAULT_TEHILLIM_PREFERENCES.darkMode,
    showKamatzKatan:
      row?.showKamatzKatan ?? DEFAULT_TEHILLIM_PREFERENCES.showKamatzKatan,
    showEnglish: row?.showEnglish ?? DEFAULT_TEHILLIM_PREFERENCES.showEnglish,
    showTeamim: row?.showTeamim ?? DEFAULT_TEHILLIM_PREFERENCES.showTeamim,
  };
}

export function fontFamilyClass(fontFamily: string) {
  switch (fontFamily) {
    case "large-clear":
      return "tehillim-font-large-clear";
    case "sbl":
      return "tehillim-font-sbl";
    default:
      return "hebrew-text";
  }
}
