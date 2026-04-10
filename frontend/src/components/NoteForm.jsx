import { useState } from "react";

function NoteForm({ note, onSubmit, onCancel }) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), content });
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />
      <textarea
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
      />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {note ? "Save changes" : "Create note"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default NoteForm;
