"use client";

import { useReducer, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { boardReducer } from "@/lib/boardReducer";
import { dummyBoard } from "@/lib/dummyData";
import type { Board as BoardType } from "@/lib/types";
import { Column } from "./Column";
import { KanbanCardOverlay } from "./Card";

function findColumnByCardId(board: BoardType, cardId: string) {
  return board.columns.find((col) => col.cardIds.includes(cardId));
}

function findColumnById(board: BoardType, id: string) {
  return board.columns.find((col) => col.id === id);
}

export function Board() {
  const [board, dispatch] = useReducer(boardReducer, dummyBoard);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeCard = activeCardId ? board.cards[activeCardId] : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByCardId(board, activeId);
    const overColumn =
      findColumnById(board, overId) ?? findColumnByCardId(board, overId);

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    const overIndex = overColumn.cardIds.includes(overId)
      ? overColumn.cardIds.indexOf(overId)
      : overColumn.cardIds.length;

    dispatch({
      type: "MOVE_CARD",
      cardId: activeId,
      toColumnId: overColumn.id,
      toIndex: overIndex,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumn = findColumnByCardId(board, activeId);
    const overColumn =
      findColumnById(board, overId) ?? findColumnByCardId(board, overId);

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id !== overColumn.id) return;

    const activeIndex = activeColumn.cardIds.indexOf(activeId);
    const overIndex = overColumn.cardIds.includes(overId)
      ? overColumn.cardIds.indexOf(overId)
      : overColumn.cardIds.length - 1;

    if (activeIndex !== overIndex) {
      dispatch({
        type: "MOVE_CARD",
        cardId: activeId,
        toColumnId: overColumn.id,
        toIndex: overIndex,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-2 border-accent-yellow bg-navy px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Project Board
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Drag cards between columns to track progress
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 overflow-x-auto bg-gradient-to-br from-slate-100 to-blue-50 p-6">
          <div className="flex gap-4" data-testid="board-columns">
            {board.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={column.cardIds.map((id) => board.cards[id]).filter(Boolean)}
                onRename={(columnId, title) =>
                  dispatch({ type: "RENAME_COLUMN", columnId, title })
                }
                onAddCard={(columnId, title, details) =>
                  dispatch({
                    type: "ADD_CARD",
                    columnId,
                    card: {
                      id: crypto.randomUUID(),
                      title,
                      details,
                    },
                  })
                }
                onDeleteCard={(cardId) =>
                  dispatch({ type: "DELETE_CARD", cardId })
                }
              />
            ))}
          </div>
        </main>

        <DragOverlay>
          {activeCard ? <KanbanCardOverlay card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
