import { TEHILLIM_CHAPTERS } from "@/lib/tehillim/metadata";
import { requireAppAccess } from "@/lib/access";
import { getChapterData } from "@/lib/tehillim/queries";

import { ChapterReader } from "../components/ChapterReader";
import { ToastMessage } from "../components/ToastMessage";

type PageProps = {
  searchParams?: Promise<{ chapter?: string; saved?: string }>;
};

export default async function TehillimChapterPage({ searchParams }: PageProps) {
  const user = await requireAppAccess("tehillim");
  const params = await searchParams;
  const selectedChapter = Math.min(
    150,
    Math.max(1, Number(params?.chapter ?? 1) || 1),
  );

  const data = await getChapterData(user.id, selectedChapter);
  const fallbackMeta = TEHILLIM_CHAPTERS[selectedChapter - 1];
  const meta = data.meta ?? fallbackMeta;
  const toast =
    params?.saved === "1" ? "נשמר בסימניות שלי בהצלחה" : null;

  return (
    <div className={data.preferences.darkMode ? "tehillim-shell tehillim-dark" : "tehillim-shell"}>
      <ChapterReader
        chapter={selectedChapter}
        meta={meta}
        verses={data.verses}
        comments={data.comments}
        highlights={data.highlights}
        phraseBreaks={data.phraseBreaks}
        preferences={data.preferences}
        isFavorite={data.favoriteChapters.has(selectedChapter)}
        readCount={data.readCounts[selectedChapter] ?? 0}
      />
      <ToastMessage message={toast} />
    </div>
  );
}
