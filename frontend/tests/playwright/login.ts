import { Page } from '@playwright/test';

export async function login(page: Page) {
  if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
    throw 'Missing test env variables';
  }

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.fill('input[id="email"]', process.env.TEST_EMAIL);
  await page.fill('input[id="password"]', process.env.TEST_PASSWORD);
  await page.click('text=Continue');

  await page.locator('text=Projects').waitFor({ state: 'visible' });
}
