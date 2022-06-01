import { devices } from '@playwright/test';

import { test } from '../fixtures';

test.use({
  ...devices['Galaxy S9+'],
});

test('test', async ({ page }) => {
  await page.goto('/', {
    waitUntil: 'networkidle',
  });

  await page.locator('text=See you on the big screen!').waitFor({ state: 'visible' });

  await page
    .locator(
      'text=We’re working to deliver the best mobile experience possible. In the meantime, please visit us on a device with a larger screen.',
    )
    .waitFor({ state: 'visible' });

  // It would be nice if we could screenshot this page. Since some of our fonts are optionally loaded, our screenshot tests would not be reliable.
  // See `_document.js` and fonts that are `display=optional`
  // expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
  //   `small_screen.png`
  // );
});
