// Two tabs below the card:
//   Banned  — every banned attribute; tap one to restore it.
//   History — every title discovered this session; tap one to clear it.
function BanHistoryPanel({ tab, setTab, banned, history, onUnban, onRemoveHistory }) {
  const bannedItems = banned.map((key) => {
    const i = key.indexOf(':')
    return { key, type: key.slice(0, i).toUpperCase(), label: key.slice(i + 1) }
  })

  return (
    <section className="panel">
      <div className="tabs">
        <button
          className={`tab${tab === 'Banned' ? ' active' : ''}`}
          onClick={() => setTab('Banned')}
        >
          Banned · {banned.length}
        </button>
        <button
          className={`tab${tab === 'History' ? ' active' : ''}`}
          onClick={() => setTab('History')}
        >
          History · {history.length}
        </button>
      </div>

      {tab === 'Banned' &&
        (banned.length ? (
          <>
            <div className="hint">TAP TO RESTORE — THESE FILTERS ARE HIDING TITLES</div>
            <div className="chips">
              {bannedItems.map((b) => (
                <button key={b.key} className="ban-chip" onClick={() => onUnban(b.key)}>
                  <span className="ban-type">{b.type}</span>
                  {b.label}
                  <span className="x">✕</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="empty-text">
            Nothing banned yet. Tap any tag on the card — a genre, era, language or runtime — and it
            lands here, quietly removed from your discoveries.
          </p>
        ))}

      {tab === 'History' &&
        (history.length ? (
          <>
            <div className="hint">ALREADY DISCOVERED — TAP TO REMOVE FROM THE LOG</div>
            <div className="chips">
              {history.map((h) => (
                <button key={h.id} className="ban-chip" onClick={() => onRemoveHistory(h.id)}>
                  {h.title}
                  {h.year && <span className="muted">{h.year}</span>}
                  <span className="x">↺</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="empty-text">No discoveries yet. Every title you reveal is logged here.</p>
        ))}
    </section>
  )
}

export default BanHistoryPanel
