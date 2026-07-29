import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ETHIOPIAN_CHANNELS } from "@/lib/ethiopian-youtube";

function validSignature(body: string, signature: string | null): boolean {
  const secret = process.env.YOUTUBE_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  if (!signature?.startsWith("sha1=")) return false;

  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const received = signature.slice(5);
  if (expected.length !== received.length) return false;

  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const mode = request.nextUrl.searchParams.get("hub.mode");

  if (!challenge || !["subscribe", "unsubscribe"].includes(mode ?? "")) {
    return new NextResponse("Invalid verification request", { status: 400 });
  }

  return new NextResponse(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-hub-signature"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const channelId = body.match(/<yt:channelId>([^<]+)<\/yt:channelId>/)?.[1];
  const approved = ETHIOPIAN_CHANNELS.some((channel) => channel.channelId === channelId);

  if (!approved) {
    return new NextResponse("Ignored", { status: 202 });
  }

  revalidateTag("ethiopian-youtube", "max");
  return new NextResponse(null, { status: 204 });
}
