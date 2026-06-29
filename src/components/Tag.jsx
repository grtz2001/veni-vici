// A single clickable attribute chip on the title card.
// Clicking it bans that attribute.
function Tag({ label, onClick }) {
  return (
    <button type="button" className="chip" onClick={onClick}>
      {label}
    </button>
  )
}

export default Tag
