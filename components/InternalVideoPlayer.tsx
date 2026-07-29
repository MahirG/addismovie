"use client";

import {
  ExternalLink,
  Film,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InternalMediaItem } from "@/lib/internal-media";

type Props = {
  items: InternalMediaItem[];
  initialItemId?: string;
};

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type YouTubeNamespace = {
  Player: new (
    target: HTMLElement,
    options: {
      width: string;
      height: string;
      videoId?: string;
      host?: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
        onError: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("The YouTube player requires a browser."));
  }

  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube player API did not initialize."));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("Unable to load YouTube player API."));
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = Math.floor(value % 60);
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function sourceLabel(item: InternalMediaItem): string {
  if (item.source.kind === "youtube" || item.source.kind === "youtube-playlist") {
    return "Authorized YouTube embed";
  }
  return item.source.kind === "hls" ? "Licensed adaptive stream" : "Licensed video file";
}

export function InternalVideoPlayer({ items, initialItemId }: Props) {
  const firstId = initialItemId ?? items[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstId);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(85);
  const [muted, setMuted] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const youtubeMountRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? items[0],
    [activeId, items],
  );

  const activeIndex = activeItem
    ? items.findIndex((item) => item.id === activeItem.id)
    : -1;

  useEffect(() => {
    if (!activeItem) return;

    setPlaying(false);
    setLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);

    youtubePlayerRef.current?.destroy();
    youtubePlayerRef.current = null;

    if (
      activeItem.source.kind !== "youtube" &&
      activeItem.source.kind !== "youtube-playlist"
    ) {
      return;
    }

    let cancelled = false;
    let poller: number | undefined;

    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !youtubeMountRef.current) return;

        const isPlaylist = activeItem.source.kind === "youtube-playlist";
        const playerVars: Record<string, string | number> = {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        };

        if (isPlaylist) {
          playerVars.listType = "playlist";
          playerVars.list = activeItem.source.playlistId;
        }

        const player = new YT.Player(youtubeMountRef.current, {
          width: "100%",
          height: "100%",
          host: "https://www.youtube-nocookie.com",
          videoId:
            activeItem.source.kind === "youtube" ? activeItem.source.videoId : undefined,
          playerVars,
          events: {
            onReady: ({ target }) => {
              if (cancelled) return;
              youtubePlayerRef.current = target;
              target.setVolume(volume);
              if (muted) target.mute();
              setDuration(target.getDuration() || 0);
              setLoading(false);
              poller = window.setInterval(() => {
                setCurrentTime(target.getCurrentTime() || 0);
                setDuration(target.getDuration() || 0);
              }, 500);
            },
            onStateChange: ({ data }) => {
              setPlaying(data === YT.PlayerState.PLAYING);
              setLoading(data === YT.PlayerState.BUFFERING);
            },
            onError: ({ data }) => {
              const message =
                data === 101 || data === 150
                  ? "The publisher has disabled embedding for this title."
                  : "This video is currently unavailable.";
              setError(message);
              setLoading(false);
            },
          },
        });

        youtubePlayerRef.current = player;
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Unable to load video player.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (poller) window.clearInterval(poller);
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
    };
  }, [activeItem, muted, volume]);

  useEffect(() => {
    if (!activeItem || activeItem.source.kind === "youtube" || activeItem.source.kind === "youtube-playlist") {
      return;
    }

    const video = nativeVideoRef.current;
    if (!video) return;

    let disposed = false;
    let destroyHls: (() => void) | undefined;

    const prepare = async () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.volume = volume / 100;
      video.muted = muted;

      if (activeItem.source.kind === "mp4") {
        video.src = activeItem.source.url;
        video.load();
        setLoading(false);
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = activeItem.source.url;
        video.load();
        setLoading(false);
        return;
      }

      const Hls = (await import("hls.js")).default;
      if (disposed) return;

      if (!Hls.isSupported()) {
        setError("This browser cannot play the licensed HLS stream.");
        setLoading(false);
        return;
      }

      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(activeItem.source.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("The licensed stream could not be loaded.");
          setLoading(false);
        }
      });
      destroyHls = () => hls.destroy();
    };

    void prepare();

    return () => {
      disposed = true;
      destroyHls?.();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [activeItem, muted, volume]);

  if (!activeItem) {
    return (
      <div className="internalPlayerEmpty">
        <Film size={28} />
        <h2>No authorized movies are available yet.</h2>
        <p>Add licensed HLS/MP4 entries or configure the approved YouTube catalog.</p>
      </div>
    );
  }

  const isYouTube =
    activeItem.source.kind === "youtube" || activeItem.source.kind === "youtube-playlist";

  function togglePlayback() {
    if (isYouTube) {
      const player = youtubePlayerRef.current;
      if (!player) return;
      if (playing) player.pauseVideo();
      else player.playVideo();
      return;
    }

    const video = nativeVideoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function seek(seconds: number) {
    const next = Math.max(0, Math.min(duration || seconds, seconds));
    if (isYouTube) youtubePlayerRef.current?.seekTo(next, true);
    else if (nativeVideoRef.current) nativeVideoRef.current.currentTime = next;
    setCurrentTime(next);
  }

  function changeVolume(nextVolume: number) {
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
    if (isYouTube) {
      youtubePlayerRef.current?.setVolume(nextVolume);
      if (nextVolume === 0) youtubePlayerRef.current?.mute();
      else youtubePlayerRef.current?.unMute();
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.volume = nextVolume / 100;
      nativeVideoRef.current.muted = nextVolume === 0;
    }
  }

  function toggleMute() {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (isYouTube) {
      if (nextMuted) youtubePlayerRef.current?.mute();
      else youtubePlayerRef.current?.unMute();
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.muted = nextMuted;
    }
  }

  function playNext() {
    if (items.length < 2) return;
    const next = items[(activeIndex + 1) % items.length];
    setActiveId(next.id);
  }

  function enterFullscreen() {
    void stageRef.current?.requestFullscreen?.();
  }

  return (
    <section className="internalCinema" aria-label="AddisMovie internal video player">
      <aside className="internalSuggestions">
        <div className="suggestionsHeader">
          <span>Up next</span>
          <strong>{items.length} titles</strong>
        </div>
        <div className="suggestionsList">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`suggestionCard ${item.id === activeItem.id ? "active" : ""}`}
              onClick={() => setActiveId(item.id)}
            >
              <span
                className="suggestionPoster"
                style={item.poster ? { backgroundImage: `url(${item.poster})` } : undefined}
              >
                {!item.poster ? <span>{item.title.slice(0, 1)}</span> : null}
                <small>{String(index + 1).padStart(2, "0")}</small>
              </span>
              <span className="suggestionCopy">
                <strong>{item.title}</strong>
                <span>{item.subtitle ?? item.publisher}</span>
                <small>{sourceLabel(item)}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="internalPlayerColumn">
        <div className="internalStage" ref={stageRef}>
          <div className="internalStageBrand">
            <span className="internalBrandMark">AM</span>
            <span>AddisMovie Player</span>
          </div>

          {isYouTube ? (
            <div key={activeItem.id} ref={youtubeMountRef} className="youtubeInternalMount" />
          ) : (
            <video
              ref={nativeVideoRef}
              className="nativeInternalVideo"
              poster={activeItem.poster}
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onWaiting={() => setLoading(true)}
              onPlaying={() => setLoading(false)}
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
              onEnded={playNext}
              onError={() => {
                setError("This licensed video could not be played.");
                setLoading(false);
              }}
            />
          )}

          {loading ? <div className="internalLoader"><span /></div> : null}
          {error ? <div className="internalPlayerError">{error}</div> : null}

          <div className="internalControls">
            <input
              className="internalSeek"
              type="range"
              min="0"
              max={Math.max(duration, 1)}
              step="0.1"
              value={Math.min(currentTime, Math.max(duration, 1))}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Video position"
            />
            <div className="internalControlRow">
              <div className="internalControlGroup">
                <button type="button" onClick={() => seek(currentTime - 10)} aria-label="Back 10 seconds">
                  <RotateCcw size={18} />
                </button>
                <button type="button" className="internalPrimaryControl" onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}
                </button>
                <button type="button" onClick={() => seek(currentTime + 10)} aria-label="Forward 10 seconds">
                  <RotateCw size={18} />
                </button>
                <button type="button" onClick={playNext} aria-label="Play next title">
                  <SkipForward size={18} fill="currentColor" />
                </button>
                <span className="internalTime">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="internalControlGroup volumeGroup">
                <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={muted ? 0 : volume}
                  onChange={(event) => changeVolume(Number(event.target.value))}
                  aria-label="Volume"
                />
                <button type="button" onClick={enterFullscreen} aria-label="Fullscreen">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="internalNowPlaying">
          <div>
            <span className="internalSourcePill"><ShieldCheck size={13} /> {sourceLabel(activeItem)}</span>
            <h2>{activeItem.title}</h2>
            <p>{activeItem.description || activeItem.subtitle || `Published by ${activeItem.publisher}.`}</p>
          </div>
          <a href={activeItem.rights.evidenceUrl} target="_blank" rel="noreferrer">
            Rights source <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
