import type { Board } from "./types";

export const dummyBoard: Board = {
  columns: [
    { id: "col-backlog", title: "Backlog", cardIds: ["card-1", "card-2", "card-3"] },
    { id: "col-todo", title: "To Do", cardIds: ["card-4", "card-5"] },
    { id: "col-inprogress", title: "In Progress", cardIds: ["card-6", "card-7"] },
    { id: "col-review", title: "Review", cardIds: ["card-8"] },
    { id: "col-done", title: "Done", cardIds: ["card-9", "card-10"] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Research competitors",
      details: "Review top 5 kanban tools and note standout UX patterns.",
    },
    "card-2": {
      id: "card-2",
      title: "Define color palette",
      details: "Finalize brand colors for headings, accents, and actions.",
    },
    "card-3": {
      id: "card-3",
      title: "Sketch board layout",
      details: "Wireframe the five-column layout with card placement.",
    },
    "card-4": {
      id: "card-4",
      title: "Set up Next.js project",
      details: "Scaffold the frontend app with TypeScript and Tailwind.",
    },
    "card-5": {
      id: "card-5",
      title: "Create data model",
      details: "Define Board, Column, and Card types with dummy data.",
    },
    "card-6": {
      id: "card-6",
      title: "Build column components",
      details: "Implement renameable column headers and card lists.",
    },
    "card-7": {
      id: "card-7",
      title: "Implement drag and drop",
      details: "Wire up dnd-kit for moving cards within and across columns.",
    },
    "card-8": {
      id: "card-8",
      title: "Write unit tests",
      details: "Cover reducer logic and core component interactions.",
    },
    "card-9": {
      id: "card-9",
      title: "Add Playwright tests",
      details: "E2E coverage for add, delete, rename, and drag flows.",
    },
    "card-10": {
      id: "card-10",
      title: "Polish UI",
      details: "Refine spacing, shadows, and hover states for a pro finish.",
    },
  },
};
