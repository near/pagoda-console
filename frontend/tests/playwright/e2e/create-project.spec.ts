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
  await clickAndWaitForNavigation(page, 'button:has-text("Create")', 'pick-project');
  await page.locator('text=New Project').waitFor({ state: 'visible' });
  // Click on "Blank" project button.
  await clickAndWaitForNavigation(page, '#blank', 'new-project');
  await page.fill('[placeholder="Cool New Project"]', project);
  await clickAndWaitForNavigation(page, 'text=Create Project', 'apis?tab=keys');

  await removeProject(page);
});

// * This test assumes there are other projects that the user has access to.
test(`create tutorial project test`, async ({ page }) => {
  if (!process.env.TEST_CREATE_NFT_TUTORIAL_PROJECT || !process.env.TEST_URL) {
    throw 'missing env variables';
  }

  const project = process.env.TEST_CREATE_NFT_TUTORIAL_PROJECT;

  await login(page);

  await page.click('text=Create');
  await page.locator('text=New Project').waitFor({ state: 'visible' });
  await clickAndWaitForNavigation(page, '#tutorial', 'pick-tutorial');
  await clickAndWaitForNavigation(page, '#nft-market', 'new-nft-tutorial');
  await page.fill('[placeholder="Cool New Project"]', project);
  await clickAndWaitForNavigation(page, 'text=Create Project', 'tutorials/nfts/introduction');

  await removeProject(page);
});

async function removeProject(page: Page) {
  await clickAndWaitForNavigation(page, 'a:has-text("Settings")', 'project-settings');
  await page.click('button:has-text("Remove Project")');
  // The user might land on the /pick-project screen if there are no other projects listed on the /projects page.
  // We'll assume there are other projects on the user for now.
  await clickAndWaitForNavigation(page, 'div[role="dialog"] button:has-text("Remove")', 'projects');
}
