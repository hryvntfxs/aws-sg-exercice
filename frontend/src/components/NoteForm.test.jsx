import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NoteForm from "./NoteForm";

describe("NoteForm", () => {
  it("renders empty form in create mode", () => {
    render(<NoteForm note={null} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText("Title")).toHaveValue("");
    expect(screen.getByPlaceholderText("Content")).toHaveValue("");
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("pre-fills form when note is provided", () => {
    const note = { title: "Existing", content: "Some text" };
    render(<NoteForm note={note} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Existing");
    expect(screen.getByPlaceholderText("Content")).toHaveValue("Some text");
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("calls onSubmit with form data", async () => {
    const onSubmit = vi.fn();
    render(<NoteForm note={null} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Title"), "New title");
    await userEvent.type(screen.getByPlaceholderText("Content"), "New content");
    await userEvent.click(screen.getByText("Create"));
    expect(onSubmit).toHaveBeenCalledWith({ title: "New title", content: "New content" });
  });

  it("does not submit when title is empty", async () => {
    const onSubmit = vi.fn();
    render(<NoteForm note={null} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Content"), "Some content");
    await userEvent.click(screen.getByText("Create"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<NoteForm note={null} onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
