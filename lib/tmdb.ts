import { demoById, demoHomeData, searchDemo } from "@/lib/demo-data";
import type { HomeData, MediaType, TitleItem, WatchProvider } from "@/types";

const API_BASE = "https://api.themoviedb.org/3";
const TOKEN = process.env.TMDB_READ_TOKEN;
const REGION = process.env.TMDB_REGION || "ET";

function normalize(item: Record<string, unknown>, fallbackType?: MediaType): TitleItem {
  const mediaType = (item.media_type as MediaType | undefined) || fallbackType || "movie";
  return {
    ...(item as unknown as TitleItem),
    media_type: mediaType,
    title:
      (item.title as string | undefined) ||
      (item.name as string | undefined) ||
      "Untitled",
    original_title:
      (item.original_title as string | undefined) ||
      (item.original_name as string | undefined),
    overview: (item.overview as string | undefined) || "No synopsis is available yet.",
    poster_path: (item.poster_path as string | null | undefined) ?? null,
    backdrop_path: (item.backdrop_path as string | null | undefined) ?? null,
    vote_average: Number(item.vote_average || 0),
  };
}

async function tmdb<T>(path: string, revalidate = 3600): Promise<T> {
  if (!TOKEN) throw new Error("TMDB_READ_TOKEN is not configured");

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      accept: "application/json",
    },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

type ResultsResponse = { results: Record<string, unknown>[] };

async function list(path: string, fallbackType?: MediaType): Promise<TitleItem[]> {
  const data = await tmdb<ResultsResponse>(path);
  return data.results
    .filter((item) => item.media_type !== "person")
    .map((item) => normalize(item, fallbackType));
}

export function imageUrl(path: string | null, size: "w342" | "w500" | "w780" | "original" = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export async function getHomeData(): Promise<HomeData> {
  if (!TOKEN) return demoHomeData;

  try {
    const [trending, popularMovies, popularTV, topRated, ethiopianStories] =
      await Promise.all([
        list("/trending/all/week?language=en-US", undefined),
        list("/movie/popular?language=en-US&page=1", "movie"),
        list("/tv/popular?language=en-US&page=1", "tv"),
        list("/movie/top_rated?language=en-US&page=1", "movie"),
        list(
          "/discover/movie?language=en-US&sort_by=popularity.desc&with_original_language=am&page=1",
          "movie",
        ),
      ]);

    const hero = trending.find((item) => item.backdrop_path) || popularMovies[0];

    return {
      hero,
      trending,
      popularMovies,
      popularTV,
      topRated,
      ethiopianStories: ethiopianStories.length ? ethiopianStories : demoHomeData.ethiopianStories,
      demoMode: false,
    };
  } catch (error) {
    console.error(error);
    return demoHomeData;
  }
}

export async function searchTitles(query: string): Promise<TitleItem[]> {
  if (!query.trim()) return [];
  if (!TOKEN) return searchDemo(query);

  try {
    const data = await tmdb<ResultsResponse>(
      `/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      120,
    );
    return data.results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, 10)
      .map((item) => normalize(item));
  } catch (error) {
    console.error(error);
    return searchDemo(query);
  }
}

export async function getTitle(type: MediaType, id: string): Promise<TitleItem | null> {
  const demoItem = demoById.get(id);
  if (!TOKEN) return demoItem || null;

  try {
    const details = await tmdb<Record<string, unknown>>(
      `/${type}/${id}?language=en-US&append_to_response=videos,credits,recommendations`,
      1800,
    );

    const providersResponse = await tmdb<{
      results: Record<string, { link?: string; flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] }>;
    }>(`/${type}/${id}/watch/providers`, 1800);

    const regionData = providersResponse.results?.[REGION] || providersResponse.results?.US;
    const providers: WatchProvider[] = [
      ...(regionData?.flatrate || []).map((p) => ({ ...p, type: "stream" as const })),
      ...(regionData?.rent || []).map((p) => ({ ...p, type: "rent" as const })),
      ...(regionData?.buy || []).map((p) => ({ ...p, type: "buy" as const })),
    ].filter(
      (provider, index, collection) =>
        collection.findIndex((item) => item.provider_id === provider.provider_id) === index,
    );

    const videos = (details.videos as { results?: Array<{ site: string; type: string; official?: boolean; key: string }> })?.results || [];
    const trailer =
      videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ||
      videos.find((video) => video.site === "YouTube" && video.type === "Trailer");

    const credits = details.credits as { cast?: Array<Record<string, unknown>> } | undefined;
    const recommendations = details.recommendations as ResultsResponse | undefined;

    return {
      ...normalize(details, type),
      trailer_key: trailer?.key || null,
      cast: (credits?.cast || []).slice(0, 12).map((member) => ({
        id: Number(member.id),
        name: String(member.name || "Unknown"),
        character: member.character ? String(member.character) : undefined,
        profile_path: (member.profile_path as string | null | undefined) ?? null,
      })),
      recommendations: (recommendations?.results || []).slice(0, 12).map((item) => normalize(item, type)),
      providers,
      provider_link: regionData?.link || null,
    };
  } catch (error) {
    console.error(error);
    return demoItem || null;
  }
}
