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
};

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
  /(?:ሙሉ\s*ፊልም|full(?:\s+length)?\s+(?:ethiopian\s+)?(?:movie|film)|ethiopian\s+full\s+(?:movie|film))/i;

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

async function fetchChannelMovies(
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
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 1800 },
      },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as PlaylistItemsResponse;

    return (data.items ?? []).flatMap((item) => {
      const snippet = item.snippet;
      const videoId = item.contentDetails?.videoId ?? snippet?.resourceId?.videoId;
      const title = snippet?.title?.trim();

      if (!videoId || !title || !FULL_MOVIE_PATTERN.test(title)) return [];

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
  } catch {
    return [];
  }
}

export async function getOfficialEthiopianVideos(): Promise<{
  configured: boolean;
  videos: EthiopianVideo[];
}> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    return { configured: false, videos: [] };
  }

  const groups = await Promise.all(
    ETHIOPIAN_CHANNELS.map((channel) => fetchChannelMovies(channel, apiKey)),
  );

  const videos = groups
    .flat()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 32);

  return { configured: true, videos };
}
