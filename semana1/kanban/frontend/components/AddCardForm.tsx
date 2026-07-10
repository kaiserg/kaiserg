"use client";

import { useState } from "react";

type AddCardFormProps = {
  onAdd: (title: string, details: string) => void;
  onCancel: () => void;
};

export function AddCardForm({ onAdd, onCancel }: AddCardFormProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), details.trim());
    setTitle("");
    setDetails("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-accent-yellow/30 bg-white p-3 shadow-sm">
      <input
        type="text"
        placeholder="Card title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-navy outline-none focus:border-blue-primary"
        autoFocus
        data-testid="card-title-input"
      />
      <textarea
        placeholder="Details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={2}
        className="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-text outline-none focus:border-blue-primary"
        data-testid="card-details-input"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-purple-secondary px-3 py-1 text-sm font-medium text-white hover:opacity-90"
          data-testid="add-card-submit"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1 text-sm text-gray-text hover:text-navy"
          data-testid="add-card-cancel"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
