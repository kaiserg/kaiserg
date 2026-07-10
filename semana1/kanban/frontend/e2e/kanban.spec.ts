import { test, expect } from "@playwright/test";

test.describe("Kanban Board", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with dummy data showing 5 columns", async ({ page }) => {
    await expect(page.getByTestId("board-columns")).toBeVisible();
    const columns = page.locator("[data-testid^='kanban-column-']");
    await expect(columns).toHaveCount(5);
    await expect(page.getByText("Research competitors")).toBeVisible();
    await expect(page.getByText("Polish UI")).toBeVisible();
  });

  test("renames a column", async ({ page }) => {
    await page.getByTestId("column-title-col-backlog").click();
    const input = page.getByTestId("column-title-input-col-backlog");
    await input.fill("Icebox");
    await input.press("Enter");
    await expect(page.getByTestId("column-title-col-backlog")).toHaveText(/Icebox/);
  });

  test("adds a new card to a column", async ({ page }) => {
    await page.getByTestId("add-card-btn-col-todo").click();
    await page.getByTestId("card-title-input").fill("E2E Test Card");
    await page.getByTestId("card-details-input").fill("Created by Playwright");
    await page.getByTestId("add-card-submit").click();
    await expect(page.getByText("E2E Test Card")).toBeVisible();
    await expect(page.getByText("Created by Playwright")).toBeVisible();
  });

  test("drags a card to another column", async ({ page }) => {
    await expect(page.getByTestId("board-columns")).toBeVisible();
    const card = page.getByTestId("card-2");
    const targetColumn = page.getByTestId("kanban-column-col-done");

    await expect(card).toBeVisible();

    const cardBox = await card.boundingBox();
    const columnBox = await targetColumn.boundingBox();
    if (!cardBox || !columnBox) throw new Error("Elements not found");

    const startX = cardBox.x + cardBox.width / 2;
    const startY = cardBox.y + cardBox.height / 2;
    const endX = columnBox.x + columnBox.width / 2;
    const endY = columnBox.y + 120;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 10, startY + 10, { steps: 5 });
    await page.mouse.move(endX, endY, { steps: 25 });
    await page.mouse.up();

    await expect(targetColumn.getByText("Define color palette")).toBeVisible();
  });

  test("deletes a card", async ({ page }) => {
    await expect(page.getByText("Research competitors")).toBeVisible();
    await page.getByTestId("delete-card-1").click();
    await expect(page.getByText("Research competitors")).not.toBeVisible();
  });
});
