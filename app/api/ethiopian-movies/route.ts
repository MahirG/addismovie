import { NextResponse } from "next/server";
import {
  ETHIOPIAN_CHANNELS,
  getOfficialEthiopianVideos,
} from "@/lib/ethiopian-youtube";

export async function GET() {
  const result = await getOfficialEthiopianVideos();

  return NextResponse.json(
    {
      source: "youtube-data-api-v3",
      configured: result.configured,
      channels: ETHIOPIAN_CHANNELS,
      videos: result.videos,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    },
  );
}
