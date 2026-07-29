import type { HomeData, TitleItem } from "@/types";

const demo: TitleItem[] = [
  {
    id: "demo-difret",
    media_type: "movie",
    title: "Difret",
    overview:
      "A courageous legal fight challenges an entrenched tradition and becomes a landmark story of justice, resilience and change in Ethiopia.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2014-01-18",
    vote_average: 7.2,
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" },
    ],
    runtime: 99,
    tagline: "A story of courage from Ethiopia.",
    demo_accent: "ochre",
  },
  {
    id: "demo-lamb",
    media_type: "movie",
    title: "Lamb",
    overview:
      "A young Ethiopian boy sent to live with relatives forms a deep bond with his sheep while navigating grief, family expectations and belonging.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2015-05-20",
    vote_average: 6.8,
    genres: [
      { id: 18, name: "Drama" },
      { id: 10751, name: "Family" },
    ],
    runtime: 94,
    demo_accent: "green",
  },
  {
    id: "demo-teza",
    media_type: "movie",
    title: "Teza",
    overview:
      "An Ethiopian intellectual returns from Europe and confronts the political turmoil, memory and disillusionment reshaping his homeland.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2008-09-01",
    vote_average: 7.0,
    genres: [{ id: 18, name: "Drama" }],
    runtime: 140,
    demo_accent: "blue",
  },
  {
    id: "demo-faya-dayi",
    media_type: "movie",
    title: "Faya Dayi",
    overview:
      "A lyrical portrait of Harar explores khat, ritual, work and the dreams of young people imagining lives beyond inherited cycles.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2021-01-30",
    vote_average: 7.1,
    genres: [{ id: 99, name: "Documentary" }],
    runtime: 120,
    demo_accent: "violet",
  },
  {
    id: "demo-price-of-love",
    media_type: "movie",
    title: "The Price of Love",
    overview:
      "A taxi driver in Addis Ababa is pulled into a difficult relationship that exposes vulnerability, survival and the cost of compassion.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2015-01-01",
    vote_average: 6.9,
    genres: [{ id: 18, name: "Drama" }],
    runtime: 95,
    demo_accent: "rose",
  },
  {
    id: "demo-horizon",
    media_type: "movie",
    title: "Beyond the Horizon",
    overview:
      "A fictional AddisMovie original concept about a photographer documenting a rapidly changing Addis Ababa while rebuilding his own life.",
    poster_path: null,
    backdrop_path: null,
    release_date: "2026-09-12",
    vote_average: 8.1,
    genres: [
      { id: 18, name: "Drama" },
      { id: 10749, name: "Romance" },
    ],
    runtime: 112,
    tagline: "Every city keeps a memory.",
    demo_accent: "red",
  },
  {
    id: "demo-night-shift",
    media_type: "tv",
    title: "Addis Night Shift",
    overview:
      "A fictional premium drama following doctors, journalists and musicians whose lives intersect during one extraordinary night in Addis Ababa.",
    poster_path: null,
    backdrop_path: null,
    first_air_date: "2026-10-01",
    vote_average: 8.4,
    genres: [
      { id: 18, name: "Drama" },
      { id: 9648, name: "Mystery" },
    ],
    number_of_seasons: 1,
    tagline: "The city never tells one story.",
    demo_accent: "navy",
  },
  {
    id: "demo-highland",
    media_type: "tv",
    title: "Highland Stories",
    overview:
      "A fictional anthology series celebrating people, landscapes and legends from communities across Ethiopia.",
    poster_path: null,
    backdrop_path: null,
    first_air_date: "2026-06-06",
    vote_average: 8.0,
    genres: [{ id: 18, name: "Drama" }],
    number_of_seasons: 2,
    demo_accent: "amber",
  },
];

export const demoById = new Map(demo.map((item) => [String(item.id), item]));

export const demoHomeData: HomeData = {
  hero: demo[5],
  trending: [demo[6], demo[0], demo[7], demo[1], demo[3], demo[2]],
  popularMovies: [demo[5], demo[0], demo[1], demo[2], demo[4], demo[3]],
  popularTV: [demo[6], demo[7]],
  topRated: [demo[6], demo[5], demo[0], demo[3], demo[2]],
  ethiopianStories: [demo[0], demo[1], demo[2], demo[3], demo[4]],
  demoMode: true,
};

export function searchDemo(query: string): TitleItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return demo.filter((item) =>
    `${item.title} ${item.overview}`.toLowerCase().includes(normalized),
  );
}
