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
  "upgrade-contract",
  "enumeration",
  "core",
  "royalty",
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

// These pages are extremely long and so we will breakup the screenshots in 10k px chunks because there are loading problems trying to screenshot the whole page at once.
// Note: `chunks` represent the # of 10k px chunks it would take to render the whole page.
[
  { path: "minting", chunks: 2 },
  { path: "approvals", chunks: 3 },
  { path: "events", chunks: 2 },
].forEach(({ path, chunks }) => {
  for (let i = 0; i < chunks; i++) {
    const from = i * 10000;
    const to = from + 10000;
    test(`NFT tutorial ${path} snapshot - ${from}-${to}k px - test`, async ({
      page,
    }) => {
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

      expect(
        await page.screenshot({
          fullPage: true,
          clip: { height: 10000, width: 1280, x: 0, y: from },
        })
      ).toMatchSnapshot(`nft_tutorial_page_${path}_${i}.png`);
    });
  }
});
