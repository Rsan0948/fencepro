import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectDetail } from "../../src/screens/ProjectDetail";
import type { Project } from "../../src/types";
import { makeProject } from "../helpers/projects";

interface Handlers {
  onUpdateNotes: (id: string, notes: string) => void;
  onAddAdjustment: (id: string, adj: { label: string; amount: number }) => void;
}

function detailProps(project: Project, handlers: Partial<Handlers> = {}) {
  return {
    project,
    onBack: () => {},
    onInvoice: () => {},
    onAddAdjustment: handlers.onAddAdjustment ?? (() => {}),
    onUpdateNotes: handlers.onUpdateNotes ?? (() => {}),
    onDelete: () => {},
  };
}

function renderDetail(project: Project, handlers: Partial<Handlers> = {}) {
  return render(<ProjectDetail {...detailProps(project, handlers)} />);
}

describe("ProjectDetail notes editing", () => {
  it("shows the existing notes in an editable textarea", () => {
    renderDetail(makeProject({ notes: "Gate code 4482" }));
    expect(screen.getByRole("textbox", { name: /project notes/i })).toHaveValue("Gate code 4482");
  });

  it("hides Save until the draft differs from the saved notes", async () => {
    const user = userEvent.setup();
    renderDetail(makeProject({ notes: "original" }));
    expect(screen.queryByRole("button", { name: /save notes/i })).not.toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /project notes/i }), " updated");
    expect(screen.getByRole("button", { name: /save notes/i })).toBeInTheDocument();
  });

  it("calls onUpdateNotes with the project id and new draft on save", async () => {
    const user = userEvent.setup();
    const onUpdateNotes = vi.fn();
    renderDetail(makeProject({ id: "p_notes", notes: "" }), { onUpdateNotes });
    await user.type(screen.getByRole("textbox", { name: /project notes/i }), "Call before 8am");
    await user.click(screen.getByRole("button", { name: /save notes/i }));
    expect(onUpdateNotes).toHaveBeenCalledWith("p_notes", "Call before 8am");
  });

  it("commits a dirty draft when the textarea loses focus", async () => {
    const user = userEvent.setup();
    const onUpdateNotes = vi.fn();
    renderDetail(makeProject({ id: "p_blur", notes: "" }), { onUpdateNotes });
    await user.type(screen.getByRole("textbox", { name: /project notes/i }), "autosaved");
    await user.tab();
    expect(onUpdateNotes).toHaveBeenCalledWith("p_blur", "autosaved");
  });

  it("does not commit on blur when the draft is unchanged", async () => {
    const user = userEvent.setup();
    const onUpdateNotes = vi.fn();
    renderDetail(makeProject({ notes: "unchanged" }), { onUpdateNotes });
    await user.click(screen.getByRole("textbox", { name: /project notes/i }));
    await user.tab();
    expect(onUpdateNotes).not.toHaveBeenCalled();
  });

  it("hides Save again once the parent persists the notes", async () => {
    const user = userEvent.setup();
    const project = makeProject({ notes: "" });
    const view = renderDetail(project);
    await user.type(screen.getByRole("textbox", { name: /project notes/i }), "done");
    view.rerender(<ProjectDetail {...detailProps({ ...project, notes: "done" })} />);
    expect(screen.queryByRole("button", { name: /save notes/i })).not.toBeInTheDocument();
  });
});
