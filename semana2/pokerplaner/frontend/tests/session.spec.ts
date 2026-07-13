import { test, expect } from '@playwright/test';

const organizerName = 'Organizer';
const participantName = 'Participant';

test('organizer can create a session and participant can join and vote', async ({ page, browser }) => {
  const organizerContext = await browser.newContext();
  const organizerPage = await organizerContext.newPage();
  await organizerPage.goto('/session');

  await organizerPage.fill('input[placeholder="Your name"]', organizerName);
  await organizerPage.fill('input[placeholder="Session name"]', 'Demo Session');
  await organizerPage.click('button:has-text("Create session")');

  const codeLocator = organizerPage.locator('[data-testid="session-code"]');
  await expect(codeLocator).toHaveText(/^[A-Z0-9]{4}$/);
  const code = await codeLocator.textContent();
  expect(code).toBeTruthy();

  const participantContext = await browser.newContext();
  const participantPage = await participantContext.newPage();
  await participantPage.goto('/session');

  await participantPage.fill('input[placeholder="Your name"]', participantName);
  await participantPage.fill('input[placeholder="Session code"]', code ?? '');
  await participantPage.click('button:has-text("Join session")');

  await expect(participantPage.locator(`text=Role: Participant`)).toBeVisible();

  await organizerPage.waitForTimeout(500);
  await expect(organizerPage.locator('[data-testid="participant-name"]', { hasText: participantName })).toBeVisible();

  await participantPage.locator('button', { hasText: /^2$/ }).first().click();
  await organizerPage.waitForTimeout(500);

  await organizerPage.click('button:has-text("Reveal votes")');
  await expect(organizerPage.locator('[data-testid="participant-vote"]', { hasText: /^2$/ })).toBeVisible();
  await expect(participantPage.locator('[data-testid="participant-vote"]', { hasText: /^2$/ })).toBeVisible();
});
