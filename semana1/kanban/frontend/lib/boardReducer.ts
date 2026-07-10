import type { Board, BoardAction } from "./types";

export function boardReducer(state: Board, action: BoardAction): Board {
  switch (action.type) {
    case "RENAME_COLUMN":
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === action.columnId ? { ...col, title: action.title } : col,
        ),
      };

    case "ADD_CARD":
      return {
        ...state,
        cards: { ...state.cards, [action.card.id]: action.card },
        columns: state.columns.map((col) =>
          col.id === action.columnId
            ? { ...col, cardIds: [...col.cardIds, action.card.id] }
            : col,
        ),
      };

    case "DELETE_CARD": {
      const { [action.cardId]: _, ...remainingCards } = state.cards;
      return {
        ...state,
        cards: remainingCards,
        columns: state.columns.map((col) => ({
          ...col,
          cardIds: col.cardIds.filter((id) => id !== action.cardId),
        })),
      };
    }

    case "MOVE_CARD": {
      const sourceColumn = state.columns.find((col) =>
        col.cardIds.includes(action.cardId),
      );
      if (!sourceColumn) return state;

      const fromIndex = sourceColumn.cardIds.indexOf(action.cardId);
      const isSameColumn = sourceColumn.id === action.toColumnId;

      if (isSameColumn && fromIndex === action.toIndex) return state;

      const columns = state.columns.map((col) => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            cardIds: col.cardIds.filter((id) => id !== action.cardId),
          };
        }
        return col;
      });

      return {
        ...state,
        columns: columns.map((col) => {
          if (col.id !== action.toColumnId) return col;

          const newCardIds = [...col.cardIds];
          newCardIds.splice(action.toIndex, 0, action.cardId);
          return { ...col, cardIds: newCardIds };
        }),
      };
    }

    default:
      return state;
  }
}
