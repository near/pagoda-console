import type { Page } from '@playwright/test';

export async function clickAndWaitForNavigation(page: Page, selector: string, urlRoute: string): Promise<void> {
  if (!process.env.TEST_URL) {
    throw 'Missing test env variables';
  }

  await Promise.all([
    //* It is important to call waitForNavigation before click to set up waiting: https://playwright.dev/docs/navigations#asynchronous-navigation
    page.waitForNavigation({
      url: `${process.env.TEST_URL}/${urlRoute}`,
      waitUntil: 'load',
    }),
    page.click(selector),
  ]);
}
