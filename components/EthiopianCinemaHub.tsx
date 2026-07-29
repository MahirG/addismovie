"use client";

import Image from "next/image";
import { ExternalLink, Film, Play, Radio, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { EthiopianChannel, EthiopianVideo } from "@/lib/ethiopian-youtube";

type Props = {
  channels: EthiopianChannel[];
  videos: EthiopianVideo[];
  apiConfigured: boolean;
};

export function EthiopianCinemaHub({ channels, videos, apiConfigured }: Props) {
  const initialSlug = videos[0]?.channelSlug ?? channels[0]?.slug ?? "";
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(
    videos.find((video) => video.channelSlug === initialSlug)?.videoId ?? null,
  );

  const activeChannel =
    channels.find((channel) => channel.slug === activeSlug) ?? channels[0];

  const channelVideos = useMemo(
    () => videos.filter((video) => video.channelSlug === activeChannel?.slug),
    [activeChannel?.slug, videos],
  );

  if (!activeChannel) return null;

  const playerSource = selectedVideoId
    ? `https://www.youtube-nocookie.com/embed/${selectedVideoId}?rel=0&modestbranding=1`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=${activeChannel.uploadsPlaylistId}&rel=0&modestbranding=1`;

  function chooseChannel(channel: EthiopianChannel) {
    setActiveSlug(channel.slug);
    setSelectedVideoId(
      videos.find((video) => video.channelSlug === channel.slug)?.videoId ?? null,
    );
  }

  return (
    <div className="ethiopianHub">
      <section className="ethiopianHubHero">
        <div className="ethiopianHubGlow" aria-hidden="true" />
        <div className="pageWidth ethiopianHeroInner">
          <div className="ethiopianHeroCopy">
            <span className="sourceBadge">
              <ShieldCheck size={14} /> Official publisher embeds
            </span>
            <span className="sectionEyebrow">AddisMovie Ethiopian cinema</span>
            <h1>Watch stories<br />made at home.</h1>
            <p>
              Full Ethiopian films streamed directly from approved YouTube publishers.
              AddisMovie does not copy, re-upload or host the video files.
            </p>
            <div className="ethiopianHeroStats">
              <span><Film size={16} /> Full movies</span>
              <span><Radio size={16} /> Live channel playlists</span>
              <span><ShieldCheck size={16} /> Publisher-owned playback</span>
            </div>
          </div>
          <div className="ethiopianHeroMonogram" aria-hidden="true">አማ</div>
        </div>
      </section>

      <section className="ethiopianPlayerSection pageWidth">
        <div className="ethiopianSectionHeading">
          <div>
            <span className="sectionEyebrow">Now playing</span>
            <h2>{activeChannel.amharicName}</h2>
            <p>{activeChannel.description}</p>
          </div>
          <a
            className="publisherLink"
            href={activeChannel.profileUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open publisher <ExternalLink size={15} />
          </a>
        </div>

        <div className="channelSwitcher" role="tablist" aria-label="Official Ethiopian movie publishers">
          {channels.map((channel) => (
            <button
              key={channel.slug}
              type="button"
              role="tab"
              aria-selected={channel.slug === activeChannel.slug}
              className={`channelTab ${channel.slug === activeChannel.slug ? "active" : ""}`}
              onClick={() => chooseChannel(channel)}
            >
              <span className="channelInitial">{channel.name.slice(0, 1)}</span>
              <span>
                <strong>{channel.name}</strong>
                <small>{channel.handle}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="ethiopianPlayerShell">
          <div className="ethiopianPlayerFrame">
            <iframe
              key={playerSource}
              src={playerSource}
              title={`${activeChannel.name} official Ethiopian movie player`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <aside className="playerContext">
            <span className="liveSourceLabel"><span /> Official YouTube source</span>
            <h3>{activeChannel.name}</h3>
            <p>
              Playback, advertising, availability and copyright controls remain with the
              original YouTube publisher.
            </p>
            <div className="playerContextMeta">
              <span>Privacy-enhanced player</span>
              <span>{apiConfigured ? "Live title API enabled" : "Live playlist mode"}</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="officialTitlesSection pageWidth">
        <div className="ethiopianSectionHeading compactHeading">
          <div>
            <span className="sectionEyebrow">Official catalogue</span>
            <h2>{channelVideos.length > 0 ? "Latest full movies" : "Publisher directory"}</h2>
            <p>
              {channelVideos.length > 0
                ? "Fresh titles are loaded through YouTube Data API v3 from the selected publisher."
                : "The embedded uploads playlist remains live. Add a YouTube API key to display individual title cards."}
            </p>
          </div>
        </div>

        {channelVideos.length > 0 ? (
          <div className="officialVideoGrid">
            {channelVideos.map((video) => (
              <button
                type="button"
                key={video.videoId}
                className={`officialVideoCard ${selectedVideoId === video.videoId ? "active" : ""}`}
                onClick={() => setSelectedVideoId(video.videoId)}
              >
                <span className="officialVideoThumb">
                  <Image
                    src={video.thumbnail}
                    alt=""
                    fill
                    sizes="(max-width: 680px) 82vw, (max-width: 1100px) 42vw, 25vw"
                  />
                  <span className="officialVideoShade" />
                  <span className="officialPlay"><Play size={18} fill="currentColor" /></span>
                </span>
                <span className="officialVideoMeta">
                  <strong>{video.title}</strong>
                  <small>{video.channelTitle}</small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="publisherDirectory">
            {channels.map((channel) => (
              <article key={channel.slug} className="publisherDirectoryCard">
                <span className="publisherDirectoryMark">{channel.name.slice(0, 1)}</span>
                <div>
                  <strong>{channel.name}</strong>
                  <span>{channel.amharicName}</span>
                  <p>{channel.description}</p>
                </div>
                <button type="button" onClick={() => chooseChannel(channel)}>
                  <Play size={15} fill="currentColor" /> Watch playlist
                </button>
              </article>
            ))}
          </div>
        )}

        <div className="rightsNotice">
          <ShieldCheck size={18} />
          <p>
            AddisMovie embeds content using YouTube&apos;s official player. Film ownership,
            monetization, regional restrictions and removal controls stay with each publisher.
          </p>
        </div>
      </section>
    </div>
  );
}
