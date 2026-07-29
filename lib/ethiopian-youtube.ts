export type EthiopianChannel = {
  slug: string;
  name: string;
  amharicName: string;
  channelId: string;
  uploadsPlaylistId: string;
  handle: string;
  description: string;
  profileUrl: string;
};

export type EthiopianVideo = {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  channelSlug: string;
  durationSeconds: number;
};

export type EthiopianVideoSyncSource =
  | "youtube-data-api-v3"
  | "youtube-atom-feed"
  | "publisher-playlists";

export const ETHIOPIAN_CHANNELS: EthiopianChannel[] = [
  {
    slug: "addis-movies",
    name: "Addis Movies",
    amharicName: "አዲስ ሙቪስ",
    channelId: "UCbx5RZUPNXdQ5_PAIOGoe0Q",
    uploadsPlaylistId: "UUbx5RZUPNXdQ5_PAIOGoe0Q",
    handle: "@AddisMovies",
    description: "A long-running publisher of full Ethiopian films and contemporary Amharic cinema.",
    profileUrl: "https://www.youtube.com/channel/UCbx5RZUPNXdQ5_PAIOGoe0Q",
  },
  {
    slug: "arada-movies",
    name: "Arada Movies",
    amharicName: "አራዳ ሙቪስ",
    channelId: "UClE5X8V_7GJykqzYDARQjwg",
    uploadsPlaylistId: "UUlE5X8V_7GJykqzYDARQjwg",
    handle: "@aradamovies1685",
    description: "An Ethiopian film publisher with full movies, series and locally produced entertainment.",
    profileUrl: "https://www.youtube.com/channel/UClE5X8V_7GJykqzYDARQjwg",
  },
  {
    slug: "addis-films",
    name: "Addis Films",
    amharicName: "አዲስ ፊልምስ",
    channelId: "UCXjOPiUis9mk5SndgPn1qzA",
    uploadsPlaylistId: "UUXjOPiUis9mk5SndgPn1qzA",
    handle: "@AddisFilms",
    description: "An established Ethiopian cinema channel featuring new releases and catalogue films.",
    profileUrl: "https://www.youtube.com/channel/UCXjOPiUis9mk5SndgPn1qzA",
  },
  {
    slug: "ethiopian-films",
    name: "Ethiopian Films",
    amharicName: "የኢትዮጵያ ፊልሞች",
    channelId: "UCil-vEqrk8TY0gfErg1hFVw",
    uploadsPlaylistId: "UUtil-vEqrk8TY0gfErg1hFVw",
    handle: "@ethiopianfilms1851",
    description: "A curated archive of Ethiopian films, stories and full-length Amharic productions.",
    profileUrl: "https://www.youtube.com/channel/UCil-vEqrk8TY0gfErg1hFVw",
  },
];

const FULL_MOVIE_PATTERN =
  /(?:ሙሉ\s*ፊልም|full(?:\s+length)?\s+(?:ethiopian\s+|amharic\s+)?(?:movie|film)|(?:new\s+)?ethiopian\s+(?:full\s+)?(?:movie|film)|amharic\s+(?:full\s+)?(?:movie|film))/i;
const NON_MOVIE_PATTERN = /\b(?:trailer|teaser|shorts?|clip|episode|music\s+video|behind\s+the\s+scenes)\b/i;

const CACHE_OPTIONS: { revalidate: number; tags: string[] } = {
  revalidate: 1800,
  tags: ["ethiopian-youtube"],
};

type PlaylistCandidate = Omit<EthiopianVideo, "durationSeconds">;

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      channelTitle?: string;
      thumbnails?: {
        maxres?: { url?: string };
        standard?: { url?: string };
        high?: { url?: string };
        medium?: { url?: string };
      };
      resourceId?: { videoId?: string };
    };
    contentDetails?: { videoId?: string };
  }>;
};

type VideosResponse = {
  items?: Array<{
    id?: string;
    status?: { embeddable?: boolean; privacyStatus?: string };
    contentDetails?: { duration?: string };
  }>;
};

function isFullMovieTitle(title: string): boolean {
  return FULL_MOVIE_PATTERN.test(title) && !NON_MOVIE_PATTERN.test(title);
}

function parseIsoDuration(value?: string): number {
  if (!value) return 0;
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

function decodeXml(value: string): string {
  return value
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function xmlTag(entry: string, tagName: string): string {
  const match = entry.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function xmlAttribute(entry: string, tagName: string, attribute: string): string {
  const match = entry.match(
    new RegExp(`<${tagName}\\b[^>]*\\b${attribute}=["']([^"']+)["'][^>]*>`, "i"),
  );
  return match ? decodeXml(match[1]) : "";
}

function uniqueAndSort(videos: EthiopianVideo[]): EthiopianVideo[] {
  const unique = new Map<string, EthiopianVideo>();
  for (const video of videos) unique.set(video.videoId, video);
  return [...unique.values()]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 40);
}

async function filterEmbeddableMovies(
  candidates: PlaylistCandidate[],
  apiKey: string,
): Promise<EthiopianVideo[]> {
  if (candidates.length === 0) return [];

  const params = new URLSearchParams({
    part: "status,contentDetails",
    id: candidates.map((candidate) => candidate.videoId).join(","),
    key: apiKey,
  });

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, {
      headers: { Accept: "application/json" },
      next: CACHE_OPTIONS,
    });

    if (!response.ok) return [];
    const data = (await response.json()) as VideosResponse;
    const statusById = new Map(
      (data.items ?? []).map((item) => [
        item.id ?? "",
        {
          embeddable: item.status?.embeddable === true,
          public: item.status?.privacyStatus === "public",
          durationSeconds: parseIsoDuration(item.contentDetails?.duration),
        },
      ]),
    );

    return candidates.flatMap((candidate) => {
      const status = statusById.get(candidate.videoId);
      if (!status?.embeddable || !status.public || status.durationSeconds < 600) return [];
      return [{ ...candidate, durationSeconds: status.durationSeconds }];
    });
  } catch {
    return [];
  }
}

async function fetchChannelMoviesFromApi(
  channel: EthiopianChannel,
  apiKey: string,
): Promise<EthiopianVideo[]> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId: channel.uploadsPlaylistId,
    maxResults: "50",
    key: apiKey,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
      { headers: { Accept: "application/json" }, next: CACHE_OPTIONS },
    );

    if (!response.ok) return [];
    const data = (await response.json()) as PlaylistItemsResponse;

    const candidates = (data.items ?? []).flatMap((item): PlaylistCandidate[] => {
      const snippet = item.snippet;
      const videoId = item.contentDetails?.videoId ?? snippet?.resourceId?.videoId;
      const title = snippet?.title?.trim();

      if (!videoId || !title || !isFullMovieTitle(title)) return [];

      const thumbnail =
        snippet?.thumbnails?.maxres?.url ??
        snippet?.thumbnails?.standard?.url ??
        snippet?.thumbnails?.high?.url ??
        snippet?.thumbnails?.medium?.url ??
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      return [
        {
          videoId,
          title,
          description: snippet?.description ?? "",
          thumbnail,
          publishedAt: snippet?.publishedAt ?? "",
          channelTitle: snippet?.channelTitle ?? channel.name,
          channelSlug: channel.slug,
        },
      ];
    });

    return filterEmbeddableMovies(candidates, apiKey);
  } catch {
    return [];
  }
}

async function fetchChannelMoviesFromFeed(
  channel: EthiopianChannel,
): Promise<EthiopianVideo[]> {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.channelId)}`,
      { headers: { Accept: "application/atom+xml, application/xml;q=0.9" }, next: CACHE_OPTIONS },
    );

    if (!response.ok) return [];
    const xml = await response.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];

    return entries.flatMap((entry): EthiopianVideo[] => {
      const videoId = xmlTag(entry, "yt:videoId");
      const title = xmlTag(entry, "media:title") || xmlTag(entry, "title");
      if (!videoId || !title || !isFullMovieTitle(title)) return [];

      return [
        {
          videoId,
          title,
          description: xmlTag(entry, "media:description"),
          thumbnail:
            xmlAttribute(entry, "media:thumbnail", "url") ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          publishedAt: xmlTag(entry, "published") || xmlTag(entry, "updated"),
          channelTitle: xmlTag(entry, "name") || channel.name,
          channelSlug: channel.slug,
          durationSeconds: 0,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function getOfficialEthiopianVideos(): Promise<{
  configured: boolean;
  source: EthiopianVideoSyncSource;
  videos: EthiopianVideo[];
}> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (apiKey) {
    const apiGroups = await Promise.all(
      ETHIOPIAN_CHANNELS.map((channel) => fetchChannelMoviesFromApi(channel, apiKey)),
    );
    const apiVideos = uniqueAndSort(apiGroups.flat());
    if (apiVideos.length > 0) {
      return { configured: true, source: "youtube-data-api-v3", videos: apiVideos };
    }
  }

  const feedGroups = await Promise.all(
    ETHIOPIAN_CHANNELS.map((channel) => fetchChannelMoviesFromFeed(channel)),
  );
  const feedVideos = uniqueAndSort(feedGroups.flat());

  return {
    configured: feedVideos.length > 0,
    source: feedVideos.length > 0 ? "youtube-atom-feed" : "publisher-playlists",
    videos: feedVideos,
  };
}
