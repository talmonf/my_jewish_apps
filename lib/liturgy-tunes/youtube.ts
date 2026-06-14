import type { ExternalSearchResult } from "@/db/schema";

type YouTubeSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
  error?: { message?: string };
};

export async function searchYouTube(
  query: string,
  maxResults = 8,
): Promise<ExternalSearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    relevanceLanguage: "he",
    key: apiKey,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as YouTubeSearchResponse;
    throw new Error(body.error?.message ?? `YouTube API error (${response.status})`);
  }

  const data = (await response.json()) as YouTubeSearchResponse;

  return (data.items ?? [])
    .map((item) => {
      const videoId = item.id?.videoId;
      if (!videoId) {
        return null;
      }

      return {
        title: item.snippet?.title ?? "Untitled video",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        source: "youtube" as const,
        thumbnailUrl:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url,
        snippet: item.snippet?.description,
      };
    })
    .filter((item): item is ExternalSearchResult => item !== null);
}
