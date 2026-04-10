import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NoteDetail from "./NoteDetail";

const mockNote = {
  id: 1,
  title: "Test Note",
  content: "Test content",
  created_at: "2024-01-15T10:30:00",
  updated_at: "2024-01-15T12:00:00",
};

describe("NoteDetail", () => {
  it("renders note title and content", () => {
    render(<NoteDetail note={mockNote} onEdit={vi.fn()} onDelete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("displays timestamps", () => {
    render(<NoteDetail note={mockNote} onEdit={vi.fn()} onDelete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/created/i)).toBeInTheDocument();
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });

  it("shows 'No content' when content is empty", () => {
    const emptyNote = { ...mockNote, content: "" };
    render(<NoteDetail note={emptyNote} onEdit={vi.fn()} onDelete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText("No content")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const onEdit = vi.fn();
    render(<NoteDetail note={mockNote} onEdit={onEdit} onDelete={vi.fn()} onBack={vi.fn()} />);
    await userEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    render(<NoteDetail note={mockNote} onEdit={vi.fn()} onDelete={onDelete} onBack={vi.fn()} />);
    await userEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("calls onBack when back button is clicked", async () => {
    const onBack = vi.fn();
    render(<NoteDetail note={mockNote} onEdit={vi.fn()} onDelete={vi.fn()} onBack={onBack} />);
    await userEvent.click(screen.getByText("Back"));
    expect(onBack).toHaveBeenCalled();
  });
});
