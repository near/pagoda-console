import type { Page } from '@playwright/test';

import { test } from '../fixtures';
import { login } from '../login';
import { clickAndWaitForNavigation } from '../utils';

// * This test assumes there are other projects that the user has access to.
test(`create blank project test`, async ({ page }) => {
  if (!process.env.TEST_CREATE_BLANK_PROJECT || !process.env.TEST_URL) {
    throw 'missing env variables';
  }

  const project = process.env.TEST_CREATE_BLANK_PROJECT;

  await login(page);

  // If there are no other projects, the user will be rerouted to
  await clickAndWaitForNavigation(page, '[data-stable-id="PROJECTS_CREATE_PROJECT_LINK"]', 'pick-project');
  await page.locator('text=New Project').waitFor({ state: 'visible' });
  // Click on "Blank" project button.
  await clickAndWaitForNavigation(page, '#blank', 'new-project');
  await page.fill('[placeholder="Cool New Project"]', project);
  await clickAndWaitForNavigation(page, '[data-stable-id="NEW_PROJECT_CREATE_BUTTON"]', 'apis?tab=keys');

  await removeProject(page);
});

// * This test assumes there are other projects that the user has access to.
test(`create tutorial project test`, async ({ page }) => {
  if (!process.env.TEST_CREATE_NFT_TUTORIAL_PROJECT || !process.env.TEST_URL) {
    throw 'missing env variables';
  }

  const project = process.env.TEST_CREATE_NFT_TUTORIAL_PROJECT;

  await login(page);

  await clickAndWaitForNavigation(page, '[data-stable-id="PROJECTS_CREATE_PROJECT_LINK"]', 'pick-project');
  await page.locator('text=New Project').waitFor({ state: 'visible' });
  await clickAndWaitForNavigation(page, '#tutorial', 'pick-tutorial');
  await clickAndWaitForNavigation(page, '#nft-market', 'new-nft-tutorial');
  await page.fill('[placeholder="Cool New Project"]', project);
  await clickAndWaitForNavigation(
    page,
    '[data-stable-id="NEW_NFT_TUTORIAL_CREATE_BUTTON"]',
    'tutorials/nfts/introduction',
  );

  await removeProject(page);
});

async function removeProject(page: Page) {
  await clickAndWaitForNavigation(page, '[data-stable-id="SIDEBAR_PROJECT_SETTINGS_LINK"]', 'project-settings');
  await page.click('[data-stable-id="PROJECT_SETTINGS_OPEN_DELETE_PROJECT_MODAL"]');
  // The user might land on the /pick-project screen if there are no other projects listed on the /projects page.
  // We'll assume there are other projects on the user for now.
  await clickAndWaitForNavigation(page, '[data-stable-id="CONFIRM_MODAL_CONFIRM_BUTTON"]', 'projects');
}
