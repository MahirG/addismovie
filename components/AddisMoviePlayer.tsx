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

type Props = { items: InternalMediaItem[]; initialItemId?: string };

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};

type YTApi = {
  Player: new (
    target: HTMLElement,
    options: {
      width: string;
      height: string;
      host?: string;
      videoId?: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady(event: { target: YTPlayer }): void;
        onStateChange(event: { data: number }): void;
        onError(event: { data: number }): void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; BUFFERING: number };
};

declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTApi> | null = null;

function loadYouTubeApi(): Promise<YTApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube player API did not initialize."));
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("Unable to load the authorized video player."));
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}

function timeLabel(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = Math.floor(value % 60);
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function sourceLabel(item: InternalMediaItem): string {
  return item.source.kind === "youtube" || item.source.kind === "youtube-playlist"
    ? "Authorized YouTube embed"
    : item.source.kind === "hls"
      ? "Licensed adaptive stream"
      : "Licensed video file";
}

export function AddisMoviePlayer({ items, initialItemId }: Props) {
  const [activeId, setActiveId] = useState(initialItemId ?? items[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(85);
  const [muted, setMuted] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const youtubeMountRef = useRef<HTMLDivElement>(null);
  const youtubeRef = useRef<YTPlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? items[0],
    [activeId, items],
  );

  const activeIndex = activeItem ? items.findIndex((item) => item.id === activeItem.id) : -1;
  const isYouTube =
    activeItem?.source.kind === "youtube" || activeItem?.source.kind === "youtube-playlist";

  useEffect(() => {
    if (!activeItem || !isYouTube) return;

    let cancelled = false;
    let poller: number | undefined;
    setPlaying(false);
    setLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);

    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !youtubeMountRef.current) return;

        const vars: Record<string, string | number> = {
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

        if (activeItem.source.kind === "youtube-playlist") {
          vars.listType = "playlist";
          vars.list = activeItem.source.playlistId;
        }

        const player = new YT.Player(youtubeMountRef.current, {
          width: "100%",
          height: "100%",
          host: "https://www.youtube-nocookie.com",
          videoId: activeItem.source.kind === "youtube" ? activeItem.source.videoId : undefined,
          playerVars: vars,
          events: {
            onReady: ({ target }) => {
              if (cancelled) return;
              youtubeRef.current = target;
              target.setVolume(volumeRef.current);
              if (mutedRef.current) target.mute();
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
              setError(
                data === 101 || data === 150
                  ? "The publisher has disabled embedding for this title."
                  : "This authorized video is currently unavailable.",
              );
              setLoading(false);
            },
          },
        });

        youtubeRef.current = player;
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Unable to load this video.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (poller) window.clearInterval(poller);
      youtubeRef.current?.destroy();
      youtubeRef.current = null;
    };
  }, [activeItem, isYouTube]);

  useEffect(() => {
    if (!activeItem || isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    let disposed = false;
    let destroyHls: (() => void) | undefined;
    setPlaying(false);
    setLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);

    const prepare = async () => {
      video.volume = volumeRef.current / 100;
      video.muted = mutedRef.current;

      if (activeItem.source.kind === "mp4") {
        video.src = activeItem.source.url;
        video.load();
        setLoading(false);
        return;
      }

      if (activeItem.source.kind !== "hls") return;

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
  }, [activeItem, isYouTube]);

  if (!activeItem) {
    return (
      <div className="internalPlayerEmpty">
        <Film size={28} />
        <h2>No authorized movies are available yet.</h2>
        <p>Add a licensed HLS/MP4 title or configure an approved publisher API.</p>
      </div>
    );
  }

  function seek(value: number) {
    const next = Math.max(0, duration > 0 ? Math.min(duration, value) : value);
    if (isYouTube) youtubeRef.current?.seekTo(next, true);
    else if (videoRef.current) videoRef.current.currentTime = next;
    setCurrentTime(next);
  }

  function togglePlayback() {
    if (isYouTube) {
      if (playing) youtubeRef.current?.pauseVideo();
      else youtubeRef.current?.playVideo();
    } else if (videoRef.current) {
      if (videoRef.current.paused) void videoRef.current.play();
      else videoRef.current.pause();
    }
  }

  function setPlayerVolume(next: number) {
    setVolume(next);
    setMuted(next === 0);
    volumeRef.current = next;
    mutedRef.current = next === 0;
    if (isYouTube) {
      youtubeRef.current?.setVolume(next);
      if (next === 0) youtubeRef.current?.mute();
      else youtubeRef.current?.unMute();
    } else if (videoRef.current) {
      videoRef.current.volume = next / 100;
      videoRef.current.muted = next === 0;
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (isYouTube) {
      if (next) youtubeRef.current?.mute();
      else youtubeRef.current?.unMute();
    } else if (videoRef.current) videoRef.current.muted = next;
  }

  function playNext() {
    if (items.length > 1) setActiveId(items[(activeIndex + 1) % items.length].id);
  }

  return (
    <section className="internalCinema" aria-label="AddisMovie internal video player">
      <aside className="internalSuggestions">
        <div className="suggestionsHeader"><span>Up next</span><strong>{items.length} titles</strong></div>
        <div className="suggestionsList">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`suggestionCard ${item.id === activeItem.id ? "active" : ""}`}
              onClick={() => setActiveId(item.id)}
            >
              <span className="suggestionPoster" style={item.poster ? { backgroundImage: `url(${item.poster})` } : undefined}>
                {!item.poster ? <span>{item.title.slice(0, 1)}</span> : null}
                <small>{String(index + 1).padStart(2, "0")}</small>
              </span>
              <span className="suggestionCopy">
                <strong>{item.title}</strong><span>{item.subtitle ?? item.publisher}</span><small>{sourceLabel(item)}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="internalPlayerColumn">
        <div className="internalStage" ref={stageRef}>
          <div className="internalStageBrand"><span className="internalBrandMark">AM</span><span>AddisMovie Player</span></div>
          {isYouTube ? (
            <div key={activeItem.id} ref={youtubeMountRef} className="youtubeInternalMount" />
          ) : (
            <video
              key={activeItem.id}
              ref={videoRef}
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
              onError={() => { setError("This licensed video could not be played."); setLoading(false); }}
            />
          )}
          {loading ? <div className="internalLoader"><span /></div> : null}
          {error ? <div className="internalPlayerError">{error}</div> : null}
          <div className="internalControls">
            <input className="internalSeek" type="range" min="0" max={Math.max(duration, 1)} step="0.1" value={Math.min(currentTime, Math.max(duration, 1))} onChange={(event) => seek(Number(event.target.value))} aria-label="Video position" />
            <div className="internalControlRow">
              <div className="internalControlGroup">
                <button type="button" onClick={() => seek(currentTime - 10)} aria-label="Back 10 seconds"><RotateCcw size={18} /></button>
                <button type="button" className="internalPrimaryControl" onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}</button>
                <button type="button" onClick={() => seek(currentTime + 10)} aria-label="Forward 10 seconds"><RotateCw size={18} /></button>
                <button type="button" onClick={playNext} aria-label="Play next title"><SkipForward size={18} fill="currentColor" /></button>
                <span className="internalTime">{timeLabel(currentTime)} / {timeLabel(duration)}</span>
              </div>
              <div className="internalControlGroup volumeGroup">
                <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={(event) => setPlayerVolume(Number(event.target.value))} aria-label="Volume" />
                <button type="button" onClick={() => void stageRef.current?.requestFullscreen?.()} aria-label="Fullscreen"><Maximize size={18} /></button>
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
          <a href={activeItem.rights.evidenceUrl} target="_blank" rel="noreferrer">Rights source <ExternalLink size={14} /></a>
        </div>
      </div>
    </section>
  );
}
