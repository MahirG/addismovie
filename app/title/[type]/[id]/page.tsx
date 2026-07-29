import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ExternalLink, Play, Plus, Star, Tv } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MediaRow } from "@/components/MediaRow";
import { getTitle } from "@/lib/tmdb";
import type { MediaType } from "@/types";

export default async function TitlePage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") notFound();

  const item = await getTitle(type as MediaType, id);
  if (!item) notFound();

  const backdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null;
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4) || "Coming soon";
  const duration = item.media_type === "tv"
    ? `${item.number_of_seasons || 1} season${item.number_of_seasons === 1 ? "" : "s"}`
    : `${item.runtime || 0} min`;

  return (
    <main>
      <Header />
      <section className={`detailHero demo-${item.demo_accent || "charcoal"}`}>
        {backdrop ? <Image src={backdrop} alt="" fill priority className="detailBackdrop" sizes="100vw" /> : <div className="detailPattern" />}
        <div className="detailOverlay" />
        <div className="pageWidth detailContent">
          <Link className="backLink light" href="/"><ArrowLeft size={17} /> Back to browse</Link>
          <div className="detailGrid">
            <div className={`detailPoster demo-${item.demo_accent || "charcoal"}`}>
              {poster ? (
                <Image src={poster} alt={`${item.title} poster`} fill priority sizes="280px" />
              ) : (
                <div className="posterFallback large">
                  <span className="posterMonogram">AM</span>
                  <strong>{item.title}</strong>
                  <small>ADDIS MOVIE</small>
                </div>
              )}
            </div>
            <div className="detailInfo">
              <span className="detailKicker">{item.media_type === "tv" ? "Original series" : "Feature film"}</span>
              <h1>{item.title}</h1>
              {item.tagline ? <p className="detailTagline">{item.tagline}</p> : null}
              <div className="detailFacts">
                <span><Star size={15} fill="currentColor" /> {item.vote_average.toFixed(1)}</span>
                <span><Calendar size={15} /> {year}</span>
                <span>{item.media_type === "tv" ? <Tv size={15} /> : <Clock size={15} />} {duration}</span>
                {item.status ? <span>{item.status}</span> : null}
              </div>
              <div className="detailGenres">
                {(item.genres || []).map((genre) => <span key={genre.id}>{genre.name}</span>)}
              </div>
              <p className="detailOverview">{item.overview}</p>
              <div className="detailButtons">
                {item.trailer_key ? (
                  <a className="primaryButton" href={`https://www.youtube.com/watch?v=${item.trailer_key}`} target="_blank" rel="noreferrer">
                    <Play size={18} fill="currentColor" /> Watch trailer
                  </a>
                ) : (
                  <button className="primaryButton muted" disabled><Play size={18} /> Trailer unavailable</button>
                )}
                <button className="secondaryButton"><Plus size={18} /> Add to watchlist</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="detailBody pageWidth">
        <section className="providersSection">
          <div className="sectionHeading compactHeading">
            <div>
              <span className="sectionEyebrow">Legal availability</span>
              <h2>Where to watch</h2>
              <p>Availability may vary by country. Provider data is powered by JustWatch through TMDB.</p>
            </div>
            {item.provider_link ? (
              <a className="viewAll" href={item.provider_link} target="_blank" rel="noreferrer">Open provider page <ExternalLink size={16} /></a>
            ) : null}
          </div>
          {item.providers?.length ? (
            <div className="providerList">
              {item.providers.map((provider) => (
                <div className="providerChip" key={provider.provider_id}>
                  {provider.logo_path ? (
                    <Image src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt="" width={38} height={38} />
                  ) : <span className="providerInitial">{provider.provider_name.slice(0, 1)}</span>}
                  <div><strong>{provider.provider_name}</strong><span>{provider.type}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="providerEmpty">No provider listing is currently available for the configured region.</div>
          )}
        </section>

        {item.cast?.length ? (
          <section className="castSection">
            <div className="sectionHeading compactHeading"><div><span className="sectionEyebrow">Featured talent</span><h2>Cast</h2></div></div>
            <div className="castRail">
              {item.cast.map((person) => (
                <article className="castCard" key={person.id}>
                  <div className="castPhoto">
                    {person.profile_path ? <Image src={`https://image.tmdb.org/t/p/w342${person.profile_path}`} alt={person.name} fill sizes="150px" /> : <span>{person.name.slice(0, 1)}</span>}
                  </div>
                  <strong>{person.name}</strong>
                  <span>{person.character || "Cast"}</span>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {item.recommendations?.length ? <MediaRow title="You may also like" items={item.recommendations} /> : null}
      </div>
      <Footer />
    </main>
  );
}
