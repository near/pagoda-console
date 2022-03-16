// example.spec.ts
import { test, expect, Page } from "@playwright/test";
import { login } from "../login";

test(`create blank project test`, async ({ page }) => {
  if (!process.env.TEST_CREATE_BLANK_PROJECT || !process.env.TEST_URL) {
    throw "missing env variables";
  }

  const project = process.env.TEST_CREATE_BLANK_PROJECT;

  await login(page);

  await page.click("text=Create");
  await page.locator("text=New Project").waitFor({ state: "visible" });

  await page
    .locator(
      "text=BlankA blank project with mainnet and testnet API keys. >> div"
    )
    .first()
    .click();

  await expect(page).toHaveURL(`${process.env.TEST_URL}/new-project`);

  await page.locator('[placeholder="Cool New Project"]').fill(project);

  await Promise.all([
    page.locator("text=Create a Project").click(),
    page.waitForNavigation({
      url: `${process.env.TEST_URL}/project-settings?project=**&environment=1`,
    }),
  ]);
});

test(`create tutorial project test`, async ({ page }) => {
  if (!process.env.TEST_URL) {
    throw "missing env variables";
  }

  await login(page);

  await page.click("text=Create");
  await page.locator("text=New Project").waitFor({ state: "visible" });

  await page.click("text=Choose from a variety of interactive tutorials.");

  await expect(page).toHaveURL(`${process.env.TEST_URL}/pick-tutorial`);

  await Promise.all([
    page.click("text=NFT Market"),
    page.waitForNavigation({
      url: `${process.env.TEST_URL}/tutorials/nfts/introduction?project=**&environment=1`,
    }),
  ]);
});
