import { expect } from '@playwright/test';

import setupErrorLogger from '../errorLogger';
import { test } from '../fixtures';
import { login } from '../login';

[
  'introduction',
  'predeployed-contract',
  'skeleton',
  'upgrade-contract',
  // 'enumeration',
  // 'core',
  // 'royalty',
  // 'marketplace',
  // 'minting',
  // 'approvals',
  // 'events',
].forEach((path) => {
  test(`NFT tutorial ${path} snapshot test`, async ({ page }) => {
    const project = process.env.TEST_NFT_TUTORIAL_PROJECT;

    setupErrorLogger(page);

    await login(page);

    await page.goto(`/tutorials/nfts/${path}?project=${project}&environment=1`, {
      waitUntil: 'networkidle',
    });

    const codeSnippets = await page.locator('pre', {
      has: page.locator('div a:has-text("See full example on Github")'),
    });
    const count = await codeSnippets.count();
    for (let i = 0; i < count; ++i) {
      expect(await codeSnippets.nth(i).screenshot()).toMatchSnapshot(`nft_tutorial_page_${path}_${i}.png`);
    }
  });
});

// These pages are extremely long and so we will breakup the screenshots in X px chunks because there are loading problems trying to screenshot the whole page at once.
// Note: `chunks` represent the # of X px chunks it would take to render the whole page.
// const CHUNK = 10000;
// [
//   { path: 'minting', chunks: 2 },
//   { path: 'approvals', chunks: 3 },
//   { path: 'events', chunks: 2 },
// ].forEach(({ path, chunks }) => {
//   for (let i = 0; i < chunks; i++) {
//     const from = i * CHUNK;
//     const to = from + CHUNK;
//     test(`NFT tutorial ${path} snapshot - ${from}-${to}k px - test`, async ({ page }) => {
//       const project = process.env.TEST_NFT_TUTORIAL_PROJECT;

//       setupErrorLogger(page);

//       // sign in
//       await login(page);

//       await page.goto(`/tutorials/nfts/${path}?project=${project}&environment=1`, {
//         waitUntil: 'networkidle',
//       });

//       expect(
//         await page.screenshot({
//           fullPage: true,
//           mask: [page.locator(':above(section)'), page.locator(':left-of(section)'), page.locator(':below(section)')],
//           clip: { height: CHUNK, width: 1280, x: 0, y: from },
//         }),
//       ).toMatchSnapshot(`nft_tutorial_page_${path}_${i}.png`);
//     });
//   }
// });
