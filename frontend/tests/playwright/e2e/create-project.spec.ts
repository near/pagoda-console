import { expect } from '@playwright/test';

import { test } from '../fixtures';
import { login } from '../login';

test(`create blank project test`, async ({ page }) => {
  if (!process.env.TEST_CREATE_BLANK_PROJECT || !process.env.TEST_URL) {
    throw 'missing env variables';
  }

  const project = process.env.TEST_CREATE_BLANK_PROJECT;

  await login(page);

  await page.click('text=Create');
  await page.locator('text=New Project').waitFor({ state: 'visible' });

  await page.locator('#blank').click();

  await expect(page).toHaveURL(`${process.env.TEST_URL}/new-project`);

  await page.locator('[placeholder="Cool New Project"]').fill(project);

  await Promise.all([
    page.waitForNavigation({
      url: `${process.env.TEST_URL}/apis?tab=keys`,
    }),
    page.locator('text=Create Project').click(),
  ]);

  await page.click('text=Remove Project');

  await Promise.all([
    page.waitForNavigation({
      // The user could land on the /pick-project screen if there are no other projects listed on the /projects page.
      url: `${process.env.TEST_URL}/projects`,
    }),
    page.locator('div[role="dialog"] button:has-text("Remove")').click(),
  ]);
});

test(`create tutorial project test`, async ({ page }) => {
  if (!process.env.TEST_CREATE_NFT_TUTORIAL_PROJECT || !process.env.TEST_URL) {
    throw 'missing env variables';
  }

  const project = process.env.TEST_CREATE_NFT_TUTORIAL_PROJECT;

  await login(page);

  await page.click('text=Create');
  await page.locator('text=New Project').waitFor({ state: 'visible' });

  await page.click('#tutorial');

  await expect(page).toHaveURL(`${process.env.TEST_URL}/pick-tutorial`);

  await Promise.all([
    page.waitForNavigation({
      url: `${process.env.TEST_URL}/new-nft-tutorial`,
    }),
    page.click('#nft-market'),
  ]);

  await page.locator('[placeholder="Cool New Project"]').fill(project);

  await Promise.all([
    page.waitForNavigation({
      url: `${process.env.TEST_URL}/tutorials/nfts/introduction`,
    }),
    page.locator('text=Create Project').click(),
  ]);

  await page.goto('/apis?tab=keys', { waitUntil: 'networkidle' });
  await page.click('text=Remove Project');

  await Promise.all([
    page.waitForNavigation({
      // The user could land on the /pick-project screen if there are no other projects listed on the /projects page.
      url: `${process.env.TEST_URL}/projects`,
    }),
    page.locator('div[role="dialog"] button:has-text("Remove")').click(),
  ]);
});
