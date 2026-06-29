import { useEffect, useRef, useState } from 'react'
import MovieCard from './components/MovieCard'
import BanHistoryPanel from './components/BanHistoryPanel'
import { fetchRandomMovie, hasTmdbCredentials, isBanned, tagsFor } from './api'
import './App.css'

// How many random titles we'll try before giving up (some random ids 404,
// and some get filtered out by the ban list).
const ATTEMPTS = 40

function App() {
  const [current, setCurrent] = useState(null) // the single title on screen
  const [banned, setBanned] = useState([]) // banned attribute keys
  const [history, setHistory] = useState([]) // titles seen this session
  const [tab, setTab] = useState('Banned')
  const [loading, setLoading] = useState(true)
  const [noResults, setNoResults] = useState(false)
  const started = useRef(false) // guard StrictMode's double mount

  // Fetch random titles until we find one that has an image and isn't
  // blocked by the ban list. `banList` is passed in so callers can use the
  // freshest ban list without waiting for state to settle.
  async function discover(banList) {
    setLoading(true)
    setNoResults(false)

    for (let i = 0; i < ATTEMPTS; i++) {
      let movie = null
      try {
        movie = await fetchRandomMovie()
      } catch {
        continue // network hiccup / bad page — just try again
      }
      if (!movie || !movie.image || !movie.title) continue
      if (isBanned(movie, banList)) continue

      setCurrent(movie)
      setHistory((h) => (h.some((x) => x.id === movie.id) ? h : [movie, ...h]))
      setLoading(false)
      return
    }

    // Everything we drew was banned or unavailable.
    setCurrent(null)
    setLoading(false)
    setNoResults(true)
  }

  // First load: discover one title (only if TMDB credentials are configured).
  useEffect(() => {
    if (started.current || !hasTmdbCredentials) return
    started.current = true
    discover([])
  }, [])

  // Add an attribute to the ban list. If it makes the current title invalid,
  // immediately discover a replacement.
  function ban(key) {
    if (banned.includes(key)) return
    const next = [...banned, key]
    setBanned(next)
    if (current && tagsFor(current).some((tag) => next.includes(tag.key))) {
      discover(next)
    }
  }

  // Remove an attribute from the ban list. If nothing is on screen (because
  // the ban list emptied the pool), try discovering again.
  function unban(key) {
    const next = banned.filter((k) => k !== key)
    setBanned(next)
    if (!current && !loading) discover(next)
  }

  function removeFromHistory(id) {
    setHistory((h) => h.filter((x) => x.id !== id))
  }

  function clearBanList() {
    setBanned([])
    discover([])
  }

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">
          <span className="logo">
            Vi<span className="logo-accent">di</span>
          </span>
          <span className="tagline">VENI · VIDI · VICI</span>
        </div>
        <span className="nav-count">{history.length} discovered</span>
      </nav>

      <main className="main">
        {!hasTmdbCredentials && (
          <div className="state">
            <h1 className="state-title">Add your TMDB key.</h1>
            <p className="state-body">
              Create a <code>.env.local</code> file with{' '}
              <code>VITE_TMDB_TOKEN=your_read_access_token</code> (or{' '}
              <code>VITE_TMDB_API_KEY=your_v3_key</code>), then restart the dev server.
            </p>
          </div>
        )}

        {hasTmdbCredentials && loading && !current && (
          <div className="state">
            <h1 className="state-title">Summoning a title…</h1>
            <p className="state-body">Pulling something at random from thousands of titles.</p>
          </div>
        )}

        {!loading && noResults && (
          <div className="state">
            <h1 className="state-title">The reel ran out.</h1>
            <p className="state-body">
              Everything we drew matched your ban list. Lift a filter to start the projector again.
            </p>
            <button type="button" className="discover" onClick={clearBanList}>
              CLEAR BAN LIST
            </button>
          </div>
        )}

        {current && (
          <MovieCard
            show={current}
            onBan={ban}
            onDiscover={() => discover(banned)}
            loading={loading}
          />
        )}

        <BanHistoryPanel
          tab={tab}
          setTab={setTab}
          banned={banned}
          history={history}
          onUnban={unban}
          onRemoveHistory={removeFromHistory}
        />
      </main>
    </div>
  )
}

export default App
