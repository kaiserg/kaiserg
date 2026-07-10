import { describe, it, expect } from "vitest";
import { boardReducer } from "@/lib/boardReducer";
import { dummyBoard } from "@/lib/dummyData";

describe("boardReducer", () => {
  it("renames a column", () => {
    const result = boardReducer(dummyBoard, {
      type: "RENAME_COLUMN",
      columnId: "col-backlog",
      title: "Icebox",
    });
    expect(result.columns[0].title).toBe("Icebox");
  });

  it("adds a card to a column", () => {
    const result = boardReducer(dummyBoard, {
      type: "ADD_CARD",
      columnId: "col-todo",
      card: { id: "card-new", title: "New task", details: "Some details" },
    });
    expect(result.cards["card-new"]).toEqual({
      id: "card-new",
      title: "New task",
      details: "Some details",
    });
    expect(result.columns[1].cardIds).toContain("card-new");
  });

  it("deletes a card", () => {
    const result = boardReducer(dummyBoard, {
      type: "DELETE_CARD",
      cardId: "card-1",
    });
    expect(result.cards["card-1"]).toBeUndefined();
    expect(result.columns[0].cardIds).not.toContain("card-1");
  });

  it("moves a card to another column", () => {
    const result = boardReducer(dummyBoard, {
      type: "MOVE_CARD",
      cardId: "card-1",
      toColumnId: "col-done",
      toIndex: 0,
    });
    expect(result.columns[0].cardIds).not.toContain("card-1");
    expect(result.columns[4].cardIds[0]).toBe("card-1");
  });

  it("reorders a card within the same column", () => {
    const result = boardReducer(dummyBoard, {
      type: "MOVE_CARD",
      cardId: "card-1",
      toColumnId: "col-backlog",
      toIndex: 2,
    });
    expect(result.columns[0].cardIds).toEqual(["card-2", "card-3", "card-1"]);
  });
});
