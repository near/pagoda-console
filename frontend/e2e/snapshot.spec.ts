// example.spec.ts
import { test, expect } from "@playwright/test";

test("login test", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.screenshot()).toMatchSnapshot("login.png");
});

[
  "introduction",
  "predeployed-contract",
  "skeleton",
  "minting",
  "upgrade-contract",
  "enumeration",
  "core",
  "approvals",
  "royalty",
  "events",
  "marketplace",
].forEach((path) => {
  test(`NFT tutorial ${path} snapshot test`, async ({ page }) => {
    const project = process.env.TEST_NFT_TUTORIAL_PROJECT;

    // sign in
    await page.goto("/", { waitUntil: "networkidle" });
    await page.fill('input[id="email"]', process.env.TEST_EMAIL);
    await page.fill('input[id="password"]', process.env.TEST_PASSWORD);
    await page.click("text=Continue");

    await page.locator("text=Projects").waitFor({ state: "visible" });

    await page.goto(
      `/tutorials/nfts/${path}?project=${project}&environment=1`,
      {
        waitUntil: "networkidle",
      }
    );

    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
      `nft_tutorial_page_${path}.png`
    );
  });
});
