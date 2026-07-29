import Image from "next/image";
import Link from "next/link";
import { Play, Plus, Star } from "lucide-react";
import type { TitleItem } from "@/types";

function releaseYear(item: TitleItem) {
  return (item.release_date || item.first_air_date || "").slice(0, 4) || "Soon";
}

export function MovieCard({ item, priority = false }: { item: TitleItem; priority?: boolean }) {
  const image = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;

  return (
    <article className="movieCard">
      <Link href={`/title/${item.media_type}/${item.id}`} className="posterLink" aria-label={`View ${item.title}`}>
        <div className={`posterFrame demo-${item.demo_accent || "charcoal"}`}>
          {image ? (
            <Image
              src={image}
              alt={`${item.title} poster`}
              fill
              priority={priority}
              sizes="(max-width: 560px) 42vw, (max-width: 980px) 28vw, 220px"
            />
          ) : (
            <div className="posterFallback">
              <span className="posterMonogram">AM</span>
              <strong>{item.title}</strong>
              <small>ADDIS MOVIE</small>
            </div>
          )}
          <div className="posterShade" />
          <span className="mediaPill">{item.media_type === "tv" ? "SERIES" : "MOVIE"}</span>
          <span className="ratingPill"><Star size={12} fill="currentColor" /> {item.vote_average.toFixed(1)}</span>
          <div className="posterActions">
            <span className="roundAction"><Play size={17} fill="currentColor" /></span>
            <span className="roundAction secondary"><Plus size={17} /></span>
          </div>
        </div>
      </Link>
      <div className="movieMeta">
        <Link href={`/title/${item.media_type}/${item.id}`}>{item.title}</Link>
        <span>{releaseYear(item)} · {item.genres?.[0]?.name || (item.media_type === "tv" ? "TV Series" : "Film")}</span>
      </div>
    </article>
  );
}
