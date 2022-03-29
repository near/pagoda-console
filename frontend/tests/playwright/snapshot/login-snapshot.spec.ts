import { test, expect } from '@playwright/test';

test('login test', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('login.png');
});
