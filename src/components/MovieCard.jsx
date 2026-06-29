import Tag from './Tag'
import { tagsFor, formatRuntime } from '../api'

// Shows a single discovered title: poster image, three+ attributes
// (year / runtime / language, plus rating & genres), the clickable ban
// tags, and the Discover button.
function MovieCard({ show, onBan, onDiscover, loading }) {
  const tags = tagsFor(show)

  return (
    <article className="card">
      <div className="poster">
        <img src={show.image} alt={show.title} />
        <div className="poster-shade" />
        <div className="poster-title">{show.title}</div>
      </div>

      <div className="card-body">
        <div>
          <div className="kicker">TONIGHT'S PICK</div>
          <h1 className="title">{show.title}</h1>
          <div className="subline">
            <span className="star">★</span> {show.rating ? show.rating.toFixed(1) : 'NR'}
            <span className="sep">/</span>{' '}
            {show.genres.length ? show.genres.join(' · ') : 'Unclassified'}
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">YEAR</div>
            <div className="stat-val">{show.year || '—'}</div>
          </div>
          <div className="stat">
            <div className="stat-label">RUNTIME</div>
            <div className="stat-val">{formatRuntime(show.runtime)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">LANGUAGE</div>
            <div className="stat-val">{show.language}</div>
          </div>
        </div>

        <div>
          <div className="hint">TAP TO BAN — IT WON'T COME BACK</div>
          <div className="chips">
            {tags.map((tag) => (
              <Tag key={tag.key} label={tag.label} onClick={() => onBan(tag.key)} />
            ))}
          </div>
        </div>

        <button type="button" className="discover" onClick={onDiscover} disabled={loading}>
          {loading ? 'SUMMONING…' : 'DISCOVER ANOTHER →'}
        </button>
      </div>
    </article>
  )
}

export default MovieCard
