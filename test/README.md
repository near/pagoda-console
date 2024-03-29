# E2E Testing

Tests are written in [Playwright](https://playwright.dev). To run this locally, you will need to copy `.env.test.local.example` to `.env.test.local` and ask the team for the secrets.

The screenshot tests are used for testing tutorial pages that have dynamic content that could potentially change outside of our team (tests/snapshot/nft-tutorial-snapshot.spec.ts).

Note: playwright tests can only run on [specific OSes](https://playwright.dev/docs/library#system-requirements). It is highly recommended to run playwright tests in the dev container defined in this folder.

You can run `npm run test:e2e` for integration tests or `npm run test:snapshot` for snapshot tests.

### Updating Snapshots

Updating a single image should be as simple as downloading the playwright report from the failed github action, pulling the image from the report, and opening a PR with the new image. However, sometimes you will need to update several images.

To update several images at once, you can run the github action in `./github/workflows/snapshot-images.yml`. This action will take ~15 minutes and produce a zip file with the contents of the `./tests/snapshot` directory which contains the snapshot images. Open a PR containing these new images.

### Initial console setup for e2e tests

Go to the url of the environment you want to test:

1. Setup a user with email and password. Store these in your `.env.test.local`.
2. Create a tutorial project. Copy the slug from the url and set `TEST_NFT_TUTORIAL_PROJECT` in `.env.test.local`. This is important for both e2e and snapshot tests.
