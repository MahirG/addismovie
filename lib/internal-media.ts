export type YouTubeVideoSource = {
  kind: "youtube";
  videoId: string;
};

export type YouTubePlaylistSource = {
  kind: "youtube-playlist";
  playlistId: string;
};

export type HostedVideoSource = {
  kind: "hls" | "mp4";
  url: string;
};

export type InternalMediaSource =
  | YouTubeVideoSource
  | YouTubePlaylistSource
  | HostedVideoSource;

export type InternalMediaItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  poster?: string;
  publishedAt?: string;
  publisher: string;
  source: InternalMediaSource;
  rights: {
    status: "authorized";
    rightsHolder: string;
    evidenceUrl: string;
  };
};
