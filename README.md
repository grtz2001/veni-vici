# Vidi — Veni Vici!

A StumbleUpon-style discovery app. Hit **Discover Another** to pull a random
movie from [TMDB](https://developer.themoviedb.org/docs/getting-started), one at
a time, with its poster and details. Tap any attribute — genre, era, language,
or runtime — to **ban** it and keep those movies out of future rolls.

## Setup

This app calls TMDB, which needs credentials:

1. Get a key/token at https://www.themoviedb.org/settings/api
2. Copy `.env.example` to `.env.local` and fill in **one** of:
   - `VITE_TMDB_TOKEN` — the v4 "API Read Access Token" (recommended), or
   - `VITE_TMDB_API_KEY` — the classic v3 API key
3. Restart the dev server after editing the env file.

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # oxlint
```

## How it works

- **`src/api.js`** — the data layer. `fetchRandomMovie()` makes the `async/await`
  TMDB calls (random discover page → movie details); `normalizeMovie()` reduces
  the response to a consistent shape; `tagsFor()` / `isBanned()` derive the
  bannable attributes.
- **`src/App.jsx`** — holds the state (`current`, `banned`, `history`) and the
  discover/ban/unban logic. Discovering retries random ids until one has an
  image and isn't blocked by the ban list.
- **`src/components/`** — `MovieCard` (poster + attributes + ban tags + Discover
  button), `Tag` (one clickable attribute), and `BanHistoryPanel` (the
  Banned/History tabs).

## Required features

- Discover button fires a new API fetch and shows an image plus consistent
  attributes (title, rating, genres, year, runtime, language).
- One result is viewable at a time, and the attributes always match the image.
- Results are random (random show id each call).
- Clicking an attribute on the card adds it to the ban list; clicking it in the
  ban list removes it. Banned attributes are filtered out of future results.
