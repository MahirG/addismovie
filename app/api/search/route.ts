import { NextRequest, NextResponse } from "next/server";
import { searchTitles } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchTitles(query);
  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } },
  );
}
