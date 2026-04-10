function NoteDetail({ note, onEdit, onDelete, onBack }) {
  return (
    <article className="note-detail">
      <h2>{note.title}</h2>
      <p className="note-content">{note.content || "No content"}</p>
      <p className="note-meta">
        Created: {new Date(note.created_at).toLocaleString()}
        {" | "}
        Updated: {new Date(note.updated_at).toLocaleString()}
      </p>
      <div className="detail-actions">
        <button className="btn btn-primary" onClick={() => onEdit(note)}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(note.id)}>
          Delete
        </button>
        <button className="btn" onClick={onBack}>
          Back
        </button>
      </div>
    </article>
  );
}

export default NoteDetail;
