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

async function checkYouTube(): Promise<UpstreamCheck> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return { configured: false, ok: false, status: null, detail: "missing" };

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
        detail: "rejected",
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
      detail: "unreachable",
      validChannelCount: 0,
      expectedChannelCount: ETHIOPIAN_CHANNELS.length,
    };
  }
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const [tmdb, youtube] = await Promise.all([checkTmdb(), checkYouTube()]);

  return NextResponse.json(
    {
      ok: tmdb.ok && youtube.ok,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      services: { tmdb, youtube },
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
