import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Column } from "@/components/Column";
import type { Card, Column as ColumnType } from "@/lib/types";

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

const testColumn: ColumnType = {
  id: "col-test",
  title: "Test Column",
  cardIds: ["card-1"],
};

const testCards: Card[] = [
  { id: "card-1", title: "First Card", details: "Details" },
];

describe("Column", () => {
  it("renders column title and cards", () => {
    render(
      <Column
        column={testColumn}
        cards={testCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />,
    );
    expect(screen.getByText("Test Column")).toBeInTheDocument();
    expect(screen.getByText("First Card")).toBeInTheDocument();
  });

  it("allows renaming the column", async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    render(
      <Column
        column={testColumn}
        cards={testCards}
        onRename={onRename}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />,
    );
    await user.click(screen.getByTestId("column-title-col-test"));
    const input = screen.getByTestId("column-title-input-col-test");
    await user.clear(input);
    await user.type(input, "Renamed{Enter}");
    expect(onRename).toHaveBeenCalledWith("col-test", "Renamed");
  });

  it("shows add card form and submits", async () => {
    const onAddCard = vi.fn();
    const user = userEvent.setup();
    render(
      <Column
        column={testColumn}
        cards={testCards}
        onRename={vi.fn()}
        onAddCard={onAddCard}
        onDeleteCard={vi.fn()}
      />,
    );
    await user.click(screen.getByTestId("add-card-btn-col-test"));
    await user.type(screen.getByTestId("card-title-input"), "New Card");
    await user.type(screen.getByTestId("card-details-input"), "New details");
    await user.click(screen.getByTestId("add-card-submit"));
    expect(onAddCard).toHaveBeenCalledWith("col-test", "New Card", "New details");
  });
});
