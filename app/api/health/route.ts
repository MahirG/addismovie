import { NextResponse } from "next/server";
import { ETHIOPIAN_CHANNELS } from "@/lib/ethiopian-youtube";

type UpstreamCheck = {
  configured: boolean;
  ok: boolean;
  status: number | null;
  detail?: string;
  validChannelCount?: number;
  expectedChannelCount?: number;
};

async function checkTmdb(): Promise<UpstreamCheck> {
  const token = process.env.TMDB_READ_TOKEN?.trim();
  if (!token) return { configured: false, ok: false, status: null, detail: "missing" };

  try {
    const response = await fetch("https://api.themoviedb.org/3/configuration", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    return {
      configured: true,
      ok: response.ok,
      status: response.status,
      detail: response.ok ? "reachable" : "rejected",
    };
  } catch {
    return { configured: true, ok: false, status: null, detail: "unreachable" };
  }
}

async function checkYouTubeDataApi(): Promise<UpstreamCheck> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return { configured: false, ok: false, status: null, detail: "optional key missing" };

  const params = new URLSearchParams({
    part: "id",
    id: ETHIOPIAN_CHANNELS.map((channel) => channel.channelId).join(","),
    key,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );

    if (!response.ok) {
      return {
        configured: true,
        ok: false,
        status: response.status,
        detail: "optional key rejected; official feed fallback active",
        validChannelCount: 0,
        expectedChannelCount: ETHIOPIAN_CHANNELS.length,
      };
    }

    const payload = (await response.json()) as { items?: Array<{ id?: string }> };
    const validChannelCount = payload.items?.filter((item) => item.id).length ?? 0;

    return {
      configured: true,
      ok: validChannelCount > 0,
      status: response.status,
      detail:
        validChannelCount === ETHIOPIAN_CHANNELS.length
          ? "all channels valid"
          : "some channel IDs are invalid",
      validChannelCount,
      expectedChannelCount: ETHIOPIAN_CHANNELS.length,
    };
  } catch {
    return {
      configured: true,
      ok: false,
      status: null,
      detail: "optional API unreachable; official feed fallback active",
      validChannelCount: 0,
      expectedChannelCount: ETHIOPIAN_CHANNELS.length,
    };
  }
}

async function checkYouTubeFeeds(): Promise<UpstreamCheck> {
  const checks = await Promise.all(
    ETHIOPIAN_CHANNELS.map(async (channel) => {
      try {
        const response = await fetch(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.channelId)}`,
          {
            headers: { Accept: "application/atom+xml, application/xml;q=0.9" },
            cache: "no-store",
          },
        );
        return response.ok;
      } catch {
        return false;
      }
    }),
  );

  const validChannelCount = checks.filter(Boolean).length;
  return {
    configured: true,
    ok: validChannelCount > 0,
    status: validChannelCount > 0 ? 200 : null,
    detail:
      validChannelCount === ETHIOPIAN_CHANNELS.length
        ? "all official publisher feeds reachable"
        : validChannelCount > 0
          ? "some official publisher feeds reachable"
          : "official publisher feeds unreachable",
    validChannelCount,
    expectedChannelCount: ETHIOPIAN_CHANNELS.length,
  };
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const [tmdb, youtubeDataApi, youtubeFeeds] = await Promise.all([
    checkTmdb(),
    checkYouTubeDataApi(),
    checkYouTubeFeeds(),
  ]);

  const siteConfigurationHealthy =
    siteUrl.startsWith("https://") &&
    Boolean(process.env.YOUTUBE_WEBHOOK_SECRET?.trim()) &&
    Boolean(process.env.YOUTUBE_SYNC_SECRET?.trim());
  const status =
    youtubeFeeds.ok && siteConfigurationHealthy
      ? tmdb.ok
        ? "healthy"
        : "degraded"
      : "unhealthy";

  return NextResponse.json(
    {
      ok: status !== "unhealthy",
      status,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      services: { tmdb, youtubeDataApi, youtubeFeeds },
      configuration: {
        tmdbRegion: process.env.TMDB_REGION?.trim() || "ET",
        siteUrlConfigured: siteUrl.length > 0,
        siteUrlIsHttps: siteUrl.startsWith("https://"),
        youtubeWebhookSecretConfigured: Boolean(
          process.env.YOUTUBE_WEBHOOK_SECRET?.trim(),
        ),
        youtubeSyncSecretConfigured: Boolean(process.env.YOUTUBE_SYNC_SECRET?.trim()),
      },
      checkedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
