function NoteDetail({ note, onEdit, onDelete, onBack }) {
  return (
    <article className="note-detail">
      <h2>{note.title}</h2>
      <p className="note-content">{note.content || "No content"}</p>
      <div className="note-meta">
        <span>Created {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span>Updated {new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div className="detail-actions">
        <button className="btn btn-primary" onClick={() => onEdit(note)}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(note.id)}>
          Delete
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
      </div>
    </article>
  );
}

export default NoteDetail;
