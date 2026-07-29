"use client";

import { ExternalLink, Film, Radio, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { InternalVideoPlayer } from "@/components/InternalVideoPlayer";
import type { EthiopianChannel, EthiopianVideo } from "@/lib/ethiopian-youtube";
import type { InternalMediaItem } from "@/lib/internal-media";

type Props = {
  channels: EthiopianChannel[];
  videos: EthiopianVideo[];
  licensedVideos: InternalMediaItem[];
  apiConfigured: boolean;
};

function officialItems(
  channels: EthiopianChannel[],
  videos: EthiopianVideo[],
): InternalMediaItem[] {
  return videos.flatMap((video) => {
    const channel = channels.find((item) => item.slug === video.channelSlug);
    if (!channel) return [];

    return [
      {
        id: `youtube:${video.videoId}`,
        title: video.title,
        subtitle: channel.amharicName,
        description: video.description,
        poster: video.thumbnail,
        publishedAt: video.publishedAt,
        publisher: video.channelTitle,
        source: { kind: "youtube" as const, videoId: video.videoId },
        rights: {
          status: "authorized" as const,
          rightsHolder: video.channelTitle,
          evidenceUrl: channel.profileUrl,
        },
      },
    ];
  });
}

function channelPlaylistItems(channels: EthiopianChannel[]): InternalMediaItem[] {
  return channels.map((channel) => ({
    id: `youtube-playlist:${channel.slug}`,
    title: `${channel.name} — Full Movie Playlist`,
    subtitle: channel.amharicName,
    description: channel.description,
    publisher: channel.name,
    source: {
      kind: "youtube-playlist" as const,
      playlistId: channel.uploadsPlaylistId,
    },
    rights: {
      status: "authorized" as const,
      rightsHolder: channel.name,
      evidenceUrl: channel.profileUrl,
    },
  }));
}

export function EthiopianCinemaHub({
  channels,
  videos,
  licensedVideos,
  apiConfigured,
}: Props) {
  const items = useMemo(() => {
    const youtubeItems = officialItems(channels, videos);
    return [
      ...licensedVideos,
      ...(youtubeItems.length > 0 ? youtubeItems : channelPlaylistItems(channels)),
    ];
  }, [channels, licensedVideos, videos]);

  return (
    <div className="ethiopianHub">
      <section className="ethiopianHubHero">
        <div className="ethiopianHubGlow" aria-hidden="true" />
        <div className="pageWidth ethiopianHeroInner">
          <div className="ethiopianHeroCopy">
            <span className="sourceBadge">
              <ShieldCheck size={14} /> Rights-checked playback
            </span>
            <span className="sectionEyebrow">AddisMovie Ethiopian cinema</span>
            <h1>One player.<br />Stories made at home.</h1>
            <p>
              Every Ethiopian movie now plays through the AddisMovie interface. Licensed HLS
              and MP4 titles use the native player; approved YouTube publishers use the official
              IFrame API inside the same branded experience.
            </p>
            <div className="ethiopianHeroStats">
              <span><Film size={16} /> Full films only</span>
              <span><Radio size={16} /> Automatic publisher sync</span>
              <span><ShieldCheck size={16} /> Embedding permission checked</span>
            </div>
          </div>
          <div className="ethiopianHeroMonogram" aria-hidden="true">አማ</div>
        </div>
      </section>

      <section className="ethiopianPlayerSection pageWidth">
        <div className="ethiopianSectionHeading">
          <div>
            <span className="sectionEyebrow">AddisMovie internal playback</span>
            <h2>Watch without leaving AddisMovie</h2>
            <p>
              Choose the next title from the left queue. Playback, search, fullscreen, volume,
              and progress controls use the AddisMovie visual system.
            </p>
          </div>
          <span className="publisherLink staticPublisherLabel">
            {apiConfigured ? "Live API sync enabled" : "Official playlist fallback"}
          </span>
        </div>

        <InternalVideoPlayer items={items} />
      </section>

      <section className="officialTitlesSection pageWidth">
        <div className="rightsNotice">
          <ShieldCheck size={18} />
          <p>
            Hosted HLS/MP4 entries require documented distribution rights. YouTube entries are
            accepted only from the approved publisher allowlist and only when YouTube reports
            that the video is public and embeddable. YouTube may still show mandatory source
            attribution inside its player.
          </p>
        </div>

        <div className="publisherDirectory">
          {channels.map((channel) => (
            <article key={channel.slug} className="publisherDirectoryCard">
              <span className="publisherDirectoryMark">{channel.name.slice(0, 1)}</span>
              <div>
                <strong>{channel.name}</strong>
                <span>{channel.amharicName}</span>
                <p>{channel.description}</p>
              </div>
              <a href={channel.profileUrl} target="_blank" rel="noreferrer">
                Publisher <ExternalLink size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
