// example.spec.ts
import { test, expect, Page } from "@playwright/test";
import { login } from "../login";

test(`create blank project test`, async ({ page }) => {
  if (!process.env.TEST_CREATE_BLANK_PROJECT) {
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

  await expect(page).toHaveURL("https://dev.console.pagoda.co/new-project");

  await page.locator('[placeholder="Cool New Project"]').fill(project);

  await Promise.all([
    page.locator("text=Create a Project").click(),
    page.waitForNavigation({
      url: "https://dev.console.pagoda.co/project-settings?project=**&environment=1",
    }),
  ]);
});

test(`create tutorial project test`, async ({ page }) => {
  await login(page);

  await page.click("text=Create");
  await page.locator("text=New Project").waitFor({ state: "visible" });

  await page.click("text=Choose from a variety of interactive tutorials.");

  await expect(page).toHaveURL("https://dev.console.pagoda.co/pick-tutorial");

  await Promise.all([
    page.click("text=NFT Market"),
    page.waitForNavigation({
      url: "https://dev.console.pagoda.co/tutorials/nfts/introduction?project=**&environment=1",
    }),
  ]);
});
