import { useState, useCallback } from "react";
import { fetchNotes, createNote, updateNote, deleteNote } from "./api/notes";
import NoteList from "./components/NoteList";
import NoteForm from "./components/NoteForm";
import NoteDetail from "./components/NoteDetail";
import "./App.css";

const initialNotes = await fetchNotes().catch(() => []);

function App() {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNote, setSelectedNote] = useState(null);
  const [view, setView] = useState("list");
  const [error, setError] = useState(null);

  const loadNotes = useCallback(async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
      setError(null);
    } catch {
      setError("Failed to load notes");
    }
  }, []);

  const handleCreate = async (data) => {
    try {
      await createNote(data);
      await loadNotes();
      setView("list");
    } catch {
      setError("Failed to create note");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateNote(selectedNote.id, data);
      await loadNotes();
      setView("list");
      setSelectedNote(null);
    } catch {
      setError("Failed to update note");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      await loadNotes();
      if (view === "detail") {
        setView("list");
        setSelectedNote(null);
      }
    } catch {
      setError("Failed to delete note");
    }
  };

  const handleSelect = (note) => {
    setSelectedNote(note);
    setView("detail");
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setView("edit");
  };

  return (
    <div className="app">
      <header className="app-header">
        <button className="title-btn" onClick={() => { setView("list"); setSelectedNote(null); }}>
          Notes
        </button>
        {view === "list" && (
          <button className="btn btn-primary" onClick={() => setView("create")}>
            + New note
          </button>
        )}
      </header>

      <main className="app-main">
        {error && <p className="error-message">{error}</p>}

        {view === "list" && (
          <NoteList notes={notes} onSelect={handleSelect} onDelete={handleDelete} />
        )}

        {view === "create" && (
          <NoteForm
            note={null}
            onSubmit={handleCreate}
            onCancel={() => setView("list")}
          />
        )}

        {view === "detail" && selectedNote && (
          <NoteDetail
            note={selectedNote}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBack={() => { setView("list"); setSelectedNote(null); }}
          />
        )}

        {view === "edit" && selectedNote && (
          <NoteForm
            note={selectedNote}
            onSubmit={handleUpdate}
            onCancel={() => { setView("detail"); }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
