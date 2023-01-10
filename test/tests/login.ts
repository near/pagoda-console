import type { Page } from '@playwright/test';

import { clickAndWaitForNavigation } from './utils';

export async function login(page: Page) {
  if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
    throw 'Missing test env variables';
  }

  await page.goto('/', { waitUntil: 'load' });
  await page.fill('input[id="email"]', process.env.TEST_EMAIL);
  await page.fill('input[id="password"]', process.env.TEST_PASSWORD);
  await clickAndWaitForNavigation(page, '[data-stable-id="AUTHENTICATION_EMAIL_FORM_SIGN_IN_BUTTON"]', 'projects');

  await page.locator('text=Projects').waitFor({ state: 'visible' });
}
