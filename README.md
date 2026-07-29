# AddisMovie

A polished, responsive Next.js movie-discovery and Ethiopian cinema experience built for Ethiopian audiences.

## Features

- Trending movies and TV series
- Ethiopian cinema discovery shelf
- Embedded full Ethiopian films from whitelisted official YouTube publishers
- Privacy-enhanced YouTube playlist playback that works without an API key
- Optional YouTube Data API v3 catalogue for fresh titles and thumbnails
- Live multi-search for movies, series, and people
- Detailed title pages with cast, trailers, recommendations, and watch-provider availability
- Responsive mobile, tablet, and desktop UI
- Demo content when no TMDB token is configured
- Server-side TMDB API integration

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create `.env.local`:

```env
TMDB_READ_TOKEN=your_token_here
TMDB_REGION=ET
YOUTUBE_API_KEY=your_optional_youtube_data_api_v3_key
```

`TMDB_READ_TOKEN` loads the global discovery catalogue. `YOUTUBE_API_KEY` is optional: the Ethiopian cinema playlist player works without it, while the key enables individual full-movie cards from the approved publisher list.

Keep `.env.local` private and never commit it.

## Ethiopian publisher integration

The `/ethiopian` experience uses YouTube's privacy-enhanced embed player and a fixed allowlist of established Ethiopian film channels. The internal `/api/ethiopian-movies` route reads only those channels' uploads playlists through YouTube Data API v3 and filters for full-movie titles.

AddisMovie never proxies, downloads, mirrors or re-uploads the underlying videos. Playback, monetization, regional restrictions and copyright controls remain with each original publisher.

## Data and attribution

This product uses the TMDB API for movie and television metadata. It is not endorsed or certified by TMDB.

Watch-provider availability is supplied by TMDB using JustWatch data. AddisMovie does not host, upload, or distribute copyrighted video files.
