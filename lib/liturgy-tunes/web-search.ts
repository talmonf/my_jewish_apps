import type { ExternalSearchResult } from "@/db/schema";

type GoogleCseItem = {
  title?: string;
  link?: string;
  snippet?: string;
  pagemap?: {
    cse_thumbnail?: Array<{ src?: string }>;
    cse_image?: Array<{ src?: string }>;
  };
};

type GoogleCseResponse = {
  items?: GoogleCseItem[];
  error?: { message?: string };
};

export async function searchWeb(
  query: string,
  maxResults = 8,
): Promise<ExternalSearchResult[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cseId) {
    return [];
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: cseId,
    q: query,
    num: String(Math.min(maxResults, 10)),
  });

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as GoogleCseResponse;
    throw new Error(body.error?.message ?? `Google CSE error (${response.status})`);
  }

  const data = (await response.json()) as GoogleCseResponse;

  return (data.items ?? []).flatMap((item) => {
    if (!item.link) {
      return [];
    }

    const result: ExternalSearchResult = {
      title: item.title ?? item.link,
      url: item.link,
      source: "web",
      thumbnailUrl:
        item.pagemap?.cse_thumbnail?.[0]?.src ??
        item.pagemap?.cse_image?.[0]?.src,
      snippet: item.snippet,
    };

    return [result];
  });
}
