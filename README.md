# AddisMovie

A polished, responsive Next.js movie-discovery and Ethiopian cinema experience built for Ethiopian audiences.

## Features

- Trending movies and TV series
- Ethiopian cinema discovery shelf
- Branded AddisMovie player with a left-side next-title queue
- Custom playback controls for licensed HLS and MP4 media
- Authorized YouTube playback through the official IFrame Player API
- Approved-channel synchronization through YouTube Data API or official Atom feeds
- Automatic approved-channel upload notifications through YouTube PubSubHubbub
- Production-safe `/api/health` diagnostics without exposing secret values
- Live multi-search for movies, series, and people
- Detailed title pages with cast, trailers, recommendations, and watch-provider availability
- Responsive mobile, tablet, and desktop UI
- Server-side TMDB and YouTube integrations

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

```env
TMDB_READ_TOKEN=your_token_here
TMDB_REGION=ET
YOUTUBE_API_KEY=your_optional_youtube_data_api_v3_key
NEXT_PUBLIC_SITE_URL=https://your-addismovie-domain.com
YOUTUBE_WEBHOOK_SECRET=your_long_random_webhook_secret
YOUTUBE_SYNC_SECRET=your_long_random_subscription_secret
```

`YOUTUBE_API_KEY` is optional. When it is missing, invalid, restricted, or unavailable, AddisMovie reads the approved publishers' official YouTube Atom feeds instead. `TMDB_READ_TOKEN` is required for the live global movie and TV catalogue; without it, the homepage uses the built-in demo catalogue.

Keep `.env.local` private and never commit it.

## Production health

The following endpoint reports only safe configuration booleans and upstream status codes:

```text
/api/health
```

It never returns API keys, webhook secrets, synchronization secrets, or bearer tokens.

## Internal player

The `/ethiopian` route sends every Ethiopian catalogue item through one branded player:

- `youtube` and `youtube-playlist` sources use YouTube's official IFrame Player API.
- `hls` sources use the native browser player when available and `hls.js` elsewhere.
- `mp4` sources use the native HTML5 video element.

YouTube controls can be suppressed and replaced by AddisMovie controls, but YouTube may still display required source attribution, branding, advertising, or publisher overlays. Do not cover, strip, proxy, download, or bypass those elements.

## Add a licensed hosted movie

Add a record to `data/licensed-movies.json` only after obtaining distribution rights:

```json
[
  {
    "id": "example-film",
    "title": "Example Ethiopian Film",
    "subtitle": "ምሳሌ ፊልም",
    "description": "Licensed for streaming on AddisMovie.",
    "poster": "https://cdn.example.com/example-film/poster.jpg",
    "publishedAt": "2026-07-29",
    "publisher": "Example Studio",
    "sourceType": "hls",
    "sourceUrl": "https://cdn.example.com/example-film/master.m3u8",
    "rightsHolder": "Example Studio",
    "rightsEvidenceUrl": "https://example.com/addismovie-license"
  }
]
```

Entries without HTTPS media, a rights holder, and a rights-evidence URL are rejected.

## Automatic YouTube upload synchronization

The approved-channel catalogue is cached with the `ethiopian-youtube` tag. YouTube upload notifications call:

```text
/api/youtube/webhook
```

After deployment, subscribe all approved channels by sending one authorized POST request:

```bash
curl -X POST \
  -H "Authorization: Bearer $YOUTUBE_SYNC_SECRET" \
  https://your-addismovie-domain.com/api/youtube/subscribe
```

The webhook validates its optional HMAC signature, ignores channels outside the allowlist, and revalidates the catalogue when an approved publisher uploads or updates a video.

## Rights and ingestion rules

YouTube titles are listed only when they:

1. Come from an approved publisher channel.
2. Match full-film wording such as `ሙሉ ፊልም` or `Full Ethiopian Movie`.
3. Use the official YouTube player and remain controlled by the publisher.
4. Pass the Data API's public-and-embeddable checks when a valid API key is available.

AddisMovie does not scrape protected streams, proxy video bytes, remove DRM, bypass embedding restrictions, mirror files, or re-upload publisher content.

## Data and attribution

This product uses the TMDB API for movie and television metadata. It is not endorsed or certified by TMDB.

Watch-provider availability is supplied by TMDB using JustWatch data. YouTube playback remains controlled by each publisher and YouTube.

<!-- production redeploy verification: 2026-07-29 -->
