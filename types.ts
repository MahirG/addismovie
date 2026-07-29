export type MediaType = "movie" | "tv";

export type TitleItem = {
  id: number | string;
  media_type: MediaType;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_seasons?: number;
  tagline?: string;
  status?: string;
  trailer_key?: string | null;
  providers?: WatchProvider[];
  provider_link?: string | null;
  cast?: CastMember[];
  recommendations?: TitleItem[];
  demo_accent?: string;
};

export type CastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  type: "stream" | "rent" | "buy";
};

export type HomeData = {
  hero: TitleItem;
  trending: TitleItem[];
  popularMovies: TitleItem[];
  popularTV: TitleItem[];
  topRated: TitleItem[];
  ethiopianStories: TitleItem[];
  demoMode: boolean;
};
