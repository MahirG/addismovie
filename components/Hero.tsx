import Image from "next/image";
import Link from "next/link";
import { Info, Play, Sparkles, Star } from "lucide-react";
import type { TitleItem } from "@/types";

export function Hero({ item }: { item: TitleItem }) {
  const backdrop = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4) || "2026";
  const genres = item.genres?.map((genre) => genre.name).slice(0, 3) || ["Drama", "Culture", "Addis Ababa"];

  return (
    <section className={`hero demo-${item.demo_accent || "red"}`}>
      {backdrop ? (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          className="heroImage"
          sizes="100vw"
        />
      ) : (
        <div className="heroArtwork" aria-hidden="true">
          <div className="heroOrb orbOne" />
          <div className="heroOrb orbTwo" />
          <div className="heroCity" />
          <div className="heroFilmStrip" />
        </div>
      )}
      <div className="heroOverlay" />
      <div className="heroContent pageWidth">
        <div className="heroBadge"><Sparkles size={14} /> AddisMovie premiere</div>
        <h1>{item.title}</h1>
        {item.tagline ? <p className="heroTagline">{item.tagline}</p> : null}
        <div className="heroFacts">
          <span className="match">98% Match</span>
          <span>{year}</span>
          <span>{item.media_type === "tv" ? "Series" : `${item.runtime || 112} min`}</span>
          <span className="heroRating"><Star size={13} fill="currentColor" /> {item.vote_average.toFixed(1)}</span>
          <span>HD</span>
        </div>
        <p className="heroOverview">{item.overview}</p>
        <div className="heroGenres">{genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
        <div className="heroButtons">
          <Link className="primaryButton" href={`/title/${item.media_type}/${item.id}`}>
            <Play size={19} fill="currentColor" /> Explore title
          </Link>
          <Link className="secondaryButton" href={`/title/${item.media_type}/${item.id}`}>
            <Info size={19} /> More info
          </Link>
        </div>
      </div>
      <div className="heroScrollCue"><span /> Scroll to discover</div>
    </section>
  );
}
