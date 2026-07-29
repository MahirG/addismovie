import catalog from "@/data/licensed-movies.json";
import type { InternalMediaItem } from "@/lib/internal-media";

type LicensedCatalogEntry = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  poster?: string;
  publishedAt?: string;
  publisher: string;
  sourceType: "hls" | "mp4";
  sourceUrl: string;
  rightsHolder: string;
  rightsEvidenceUrl: string;
};

function validHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function getLicensedMovies(): InternalMediaItem[] {
  return (catalog as LicensedCatalogEntry[]).flatMap((entry) => {
    if (
      !entry.id?.trim() ||
      !entry.title?.trim() ||
      !entry.publisher?.trim() ||
      !["hls", "mp4"].includes(entry.sourceType) ||
      !validHttpsUrl(entry.sourceUrl) ||
      !entry.rightsHolder?.trim() ||
      !validHttpsUrl(entry.rightsEvidenceUrl)
    ) {
      return [];
    }

    return [
      {
        id: `licensed:${entry.id}`,
        title: entry.title,
        subtitle: entry.subtitle,
        description: entry.description,
        poster: entry.poster && validHttpsUrl(entry.poster) ? entry.poster : undefined,
        publishedAt: entry.publishedAt,
        publisher: entry.publisher,
        source: {
          kind: entry.sourceType,
          url: entry.sourceUrl,
        },
        rights: {
          status: "authorized" as const,
          rightsHolder: entry.rightsHolder,
          evidenceUrl: entry.rightsEvidenceUrl,
        },
      },
    ];
  });
}
