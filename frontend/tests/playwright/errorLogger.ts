import { Page } from '@playwright/test';

function setupErrorLogger(page: Page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`Error text: "${msg.text()}"`);
  });

  page.on('pageerror', (exception) => {
    console.log(`Uncaught exception: "${exception}"`);
  });
}

export default setupErrorLogger;
