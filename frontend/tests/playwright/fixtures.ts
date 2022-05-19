import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // This will block all requests to fullstory so our testing won't create user sessions there.
    await page.route('*.fullstory.com/**', (route) => route.abort());
    await use(page);
  },
});
