import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NoteForm from "./NoteForm";

describe("NoteForm", () => {
  it("renders empty form in create mode", () => {
    render(<NoteForm note={null} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText("Note title")).toHaveValue("");
    expect(screen.getByPlaceholderText("Write something...")).toHaveValue("");
    expect(screen.getByText("Create note")).toBeInTheDocument();
  });

  it("pre-fills form when note is provided", () => {
    const note = { title: "Existing", content: "Some text" };
    render(<NoteForm note={note} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText("Note title")).toHaveValue("Existing");
    expect(screen.getByPlaceholderText("Write something...")).toHaveValue("Some text");
    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });

  it("calls onSubmit with form data", async () => {
    const onSubmit = vi.fn();
    render(<NoteForm note={null} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Note title"), "New title");
    await userEvent.type(screen.getByPlaceholderText("Write something..."), "New content");
    await userEvent.click(screen.getByText("Create note"));
    expect(onSubmit).toHaveBeenCalledWith({ title: "New title", content: "New content" });
  });

  it("does not submit when title is empty", async () => {
    const onSubmit = vi.fn();
    render(<NoteForm note={null} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Write something..."), "Some content");
    await userEvent.click(screen.getByText("Create note"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<NoteForm note={null} onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
