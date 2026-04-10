import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NoteList from "./NoteList";

const mockNotes = [
  { id: 1, title: "First note", content: "Some content", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: 2, title: "Second note", content: "More content", created_at: "2024-01-02", updated_at: "2024-01-02" },
];

describe("NoteList", () => {
  it("renders empty message when no notes", () => {
    render(<NoteList notes={[]} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it("renders list of notes with titles", () => {
    render(<NoteList notes={mockNotes} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("Second note")).toBeInTheDocument();
  });

  it("calls onSelect when a note is clicked", async () => {
    const onSelect = vi.fn();
    render(<NoteList notes={mockNotes} onSelect={onSelect} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText("First note"));
    expect(onSelect).toHaveBeenCalledWith(mockNotes[0]);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    render(<NoteList notes={mockNotes} onSelect={vi.fn()} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByText("Delete");
    await userEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("truncates long content", () => {
    const longNote = [{ ...mockNotes[0], content: "A".repeat(150) }];
    render(<NoteList notes={longNote} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
  });
});
