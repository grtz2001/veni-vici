// The Movie Database (TMDB).
// https://developer.themoviedb.org/docs/getting-started
//
// TMDB needs credentials. Put this in a `.env.local` file (see
// `.env.example`) and restart `npm run dev`:
//   VITE_TMDB_TOKEN    – a v4 "API Read Access Token" from TMDB
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

export const hasTmdbCredentials = Boolean(TOKEN)

const BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'
const MAX_PAGE = 500 // TMDB caps /discover at 500 pages

// small fetch wrapper that attaches the read access token.
async function tmdb(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  })
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

// turn TMDB's movie-details JSON into the what we actually use.
// ensure consistency across movies
export function normalizeMovie(movie) {
  return {
    id: movie.id,
    title: movie.title || movie.original_title,
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
    genres: movie.genres ? movie.genres.map((g) => g.name) : [],
    language: languageName(movie.original_language),
    runtime: movie.runtime || null,
    rating: movie.vote_average || null,
    image: movie.poster_path ? IMG_BASE + movie.poster_path : null,
  }
}

// discover a single random movie. 
export async function fetchRandomMovie() {
  const page = Math.floor(Math.random() * MAX_PAGE) + 1
  const list = await tmdb(
    `/discover/movie?include_adult=false&sort_by=popularity.desc&vote_count.gte=200&page=${page}`,
  )
  const results = list.results || []
  if (!results.length) return null
  const pick = results[Math.floor(Math.random() * results.length)]
  const detail = await tmdb(`/movie/${pick.id}`)
  return normalizeMovie(detail)
}

// work on attributes that could be banned: genre, decade, language, runtime. Each attribute has a stable `key` so the same genre/era/language/runtime always maps to the same ban entry.

// map an ISO language code (e.g. "en") to a readable name ("English").
function languageName(code) {
  if (!code) return 'Unknown'
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code
  } catch {
    return code
  }
}

export function decade(year) {
  if (!year) return 'Unknown'
  return `${Math.floor(year / 10) * 10}s`
}

export function runtimeBand(min) {
  if (!min) return 'Unknown'
  if (min < 100) return 'Short (<1h40)'
  if (min <= 130) return 'Medium'
  return 'Long (2h+)'
}

export function formatRuntime(min) {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m < 10 ? '0' : ''}${m}m`
}

// the set of bannable tags for a movie. Each tag has a stable `key` so the
// same genre/era/language/runtime always maps to the same ban entry.
export function tagsFor(movie) {
  const tags = movie.genres.map((g) => ({
    type: 'GENRE',
    label: g,
    key: `Genre:${g}`,
  }))
  tags.push({ type: 'ERA', label: decade(movie.year), key: `Decade:${decade(movie.year)}` })
  tags.push({ type: 'LANGUAGE', label: movie.language, key: `Language:${movie.language}` })
  tags.push({
    type: 'RUNTIME',
    label: runtimeBand(movie.runtime),
    key: `Runtime:${runtimeBand(movie.runtime)}`,
  })
  return tags
}

// a movie is banned if ANY of its tags is on the ban list.
export function isBanned(movie, banned) {
  return tagsFor(movie).some((tag) => banned.includes(tag.key))
}
