# AddisMovie

A polished, responsive Next.js movie-discovery experience built for Ethiopian audiences.

## Features

- Trending movies and TV series
- Ethiopian cinema discovery shelf
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
```

Use a TMDB API Read Access Token. Keep `.env.local` private and never commit it.

## Data and attribution

This product uses the TMDB API for movie and television metadata. It is not endorsed or certified by TMDB.

Watch-provider availability is supplied by TMDB using JustWatch data. AddisMovie does not host, upload, or distribute copyrighted video files.
