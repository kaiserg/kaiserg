import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanCard } from "@/components/Card";
import type { Card } from "@/lib/types";

const testCard: Card = {
  id: "card-test",
  title: "Test Card",
  details: "Test details here",
};

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

describe("KanbanCard", () => {
  it("renders title and details", () => {
    render(<KanbanCard card={testCard} onDelete={vi.fn()} />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Test details here")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<KanbanCard card={testCard} onDelete={onDelete} />);
    await user.click(screen.getByLabelText("Delete Test Card"));
    expect(onDelete).toHaveBeenCalledWith("card-test");
  });
});
