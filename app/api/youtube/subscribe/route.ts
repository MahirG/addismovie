import { NextRequest, NextResponse } from "next/server";
import { ETHIOPIAN_CHANNELS } from "@/lib/ethiopian-youtube";

export async function POST(request: NextRequest) {
  const syncSecret = process.env.YOUTUBE_SYNC_SECRET?.trim();
  const supplied = request.headers.get("authorization");

  if (!syncSecret || supplied !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl?.startsWith("https://")) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL must be a public HTTPS URL." },
      { status: 400 },
    );
  }

  const callback = `${siteUrl}/api/youtube/webhook`;
  const webhookSecret = process.env.YOUTUBE_WEBHOOK_SECRET?.trim();

  const results = await Promise.all(
    ETHIOPIAN_CHANNELS.map(async (channel) => {
      const body = new URLSearchParams({
        "hub.callback": callback,
        "hub.mode": "subscribe",
        "hub.topic": `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`,
        "hub.verify": "async",
      });

      if (webhookSecret) body.set("hub.secret", webhookSecret);

      const response = await fetch("https://pubsubhubbub.appspot.com/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
      });

      return {
        channel: channel.name,
        channelId: channel.channelId,
        accepted: response.ok,
        status: response.status,
      };
    }),
  );

  return NextResponse.json({ callback, results });
}
