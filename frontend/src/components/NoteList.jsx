function NoteList({ notes, onSelect, onDelete }) {
  if (notes.length === 0) {
    return <p className="empty-message">No notes yet. Create your first one!</p>;
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
