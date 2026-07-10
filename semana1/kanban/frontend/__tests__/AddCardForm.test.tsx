import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCardForm } from "@/components/AddCardForm";

describe("AddCardForm", () => {
  it("submits title and details", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddCardForm onAdd={onAdd} onCancel={vi.fn()} />);
    await user.type(screen.getByTestId("card-title-input"), "My Title");
    await user.type(screen.getByTestId("card-details-input"), "My Details");
    await user.click(screen.getByTestId("add-card-submit"));
    expect(onAdd).toHaveBeenCalledWith("My Title", "My Details");
  });

  it("does not submit without a title", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddCardForm onAdd={onAdd} onCancel={vi.fn()} />);
    await user.click(screen.getByTestId("add-card-submit"));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<AddCardForm onAdd={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByTestId("add-card-cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
