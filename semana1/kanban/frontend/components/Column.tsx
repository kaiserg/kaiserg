"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column as ColumnType } from "@/lib/types";
import { KanbanCard } from "./Card";
import { AddCardForm } from "./AddCardForm";

type ColumnProps = {
  column: ColumnType;
  cards: Card[];
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export function Column({
  column,
  cards,
  onRename,
  onAddCard,
  onDeleteCard,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showAddForm, setShowAddForm] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const handleTitleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed) onRename(column.id, trimmed);
    else setEditTitle(column.title);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl bg-white/80 shadow-md backdrop-blur-sm ${
        isOver ? "ring-2 ring-blue-primary" : ""
      }`}
      data-testid={`kanban-column-${column.id}`}
    >
      <div className="border-b-2 border-accent-yellow px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave();
              if (e.key === "Escape") {
                setEditTitle(column.title);
                setIsEditing(false);
              }
            }}
            className="w-full rounded border border-blue-primary px-2 py-1 text-sm font-semibold text-navy outline-none"
            autoFocus
            data-testid={`column-title-input-${column.id}`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full text-left text-sm font-semibold text-navy hover:text-blue-primary"
            data-testid={`column-title-${column.id}`}
          >
            {column.title}
            <span className="ml-2 text-xs font-normal text-gray-text">
              {cards.length}
            </span>
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-3"
        style={{ minHeight: "120px" }}
      >
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>

        {showAddForm ? (
          <AddCardForm
            onAdd={(title, details) => {
              onAddCard(column.id, title, details);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-text transition-colors hover:border-blue-primary hover:text-blue-primary"
            data-testid={`add-card-btn-${column.id}`}
          >
            + Add card
          </button>
        )}
      </div>
    </div>
  );
}
