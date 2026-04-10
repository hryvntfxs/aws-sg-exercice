function NoteList({ notes, onSelect, onDelete }) {
  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">&#9998;</span>
        <p>No notes yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id} className="note-item">
          <div className="note-item-content" onClick={() => onSelect(note)}>
            <h3>{note.title}</h3>
            <p>{note.content.length > 100 ? note.content.slice(0, 100) + "..." : note.content}</p>
          </div>
          <button
            className="btn btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default NoteList;
