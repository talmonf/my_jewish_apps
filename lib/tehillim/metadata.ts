export type TehillimChapterMeta = {
  chapter: number;
  book: number;
  dayOfWeek: number;
  dayOfMonth: number;
  author: string;
  title: string;
};

const bookForChapter = (chapter: number) => {
  if (chapter <= 41) return 1;
  if (chapter <= 72) return 2;
  if (chapter <= 89) return 3;
  if (chapter <= 106) return 4;
  return 5;
};

const monthBreaks = [
  9, 17, 22, 28, 34, 38, 43, 48, 54, 59, 65, 68, 71, 76, 78, 82, 87, 89, 96,
  103, 105, 107, 112, 118, 119, 119, 134, 139, 144, 150,
];

const weekdayBreaks = [29, 50, 72, 89, 106, 119, 150];

function findDivision(chapter: number, breaks: number[]) {
  return breaks.findIndex((end) => chapter <= end) + 1;
}

export const TEHILLIM_CHAPTERS: TehillimChapterMeta[] = Array.from(
  { length: 150 },
  (_, index) => {
    const chapter = index + 1;

    return {
      chapter,
      book: bookForChapter(chapter),
      dayOfWeek: findDivision(chapter, weekdayBreaks),
      dayOfMonth: findDivision(chapter, monthBreaks),
      author: "",
      title: `תהילים ${chapter}`,
    };
  },
);

export const SAMPLE_TEHILLIM_VERSES = [
  {
    chapter: 1,
    verse: 1,
    hebrew: "אַשְׁרֵי הָאִישׁ אֲשֶׁר לֹא הָלַךְ בַּעֲצַת רְשָׁעִים",
    english: "Happy is the man who has not walked in the counsel of the wicked.",
  },
  {
    chapter: 1,
    verse: 2,
    hebrew: "כִּי אִם בְּתוֹרַת יְהוָה חֶפְצוֹ וּבְתוֹרָתוֹ יֶהְגֶּה יוֹמָם וָלָיְלָה",
    english: "Rather, his desire is in the Torah of Hashem.",
  },
  {
    chapter: 23,
    verse: 1,
    hebrew: "מִזְמוֹר לְדָוִד יְהוָה רֹעִי לֹא אֶחְסָר",
    english: "A song of David. Hashem is my shepherd; I shall lack nothing.",
  },
];

import { annotateSuperscriptionTokens } from "./superscription";

export function tokenizeHebrew(hebrew: string, verse = 1) {
  return annotateSuperscriptionTokens(hebrew, verse);
}
