# **Pagoda Developer Console Frontend**

View at [http://console.near.dev]

# Stack

Language: Typescript

Framework: [Next.js](https://nextjs.org/)

UI: [Radix](https://www.radix-ui.com/) & [Stitches](https://stitches.dev/)

Identity Management: [Firebase Auth](https://firebase.google.com/docs/auth)

# Quickstart

Before getting started, make sure you have the [Dev Console API](https://github.com/near/developer-console-api) up and running. Once you have the API running, continue on with the frontend quickstart guide.

There are two ways to run this project locally:

1. **VS Code Dev Containers (Docker).** This is the recommended approach when first starting with the project.
2. **Manually with NVM and NPM.** This will provide the best performance, but you might run in to environment issues based on how your machine is configured.

However, before you start the project, you'll need to configure your environment variables:

### Local Environment Variables

Environment variables are loaded automatically from `.env` and `.env.local` file at the root of the project. Use `.env.local` to override any values in `.env`. Please copy the `.env.local.example` file as a starting point for your own `.env.local` file and ask the team for any secrets if there are any.

To make the environment variable available in the browser at runtime, it must be prefixed with `NEXT_PUBLIC_`: [Next.js Environment Variables docs](https://nextjs.org/docs/basic-features/environment-variables)

All environment variables are read into a config object in [utils/config.ts](utils/config.ts). This allows casting the values to their desired types in a central location and early process termination if any values were not defined.

Now that your environment variables are set up, continue with one of the quickstart options below:

### Option 1: VS Code Dev Containers (Docker)

1. Follow the [official Installation instructions](https://code.visualstudio.com/docs/remote/containers#_installation) from VS Code to install Docker and the required extensions.
2. Open this directory in VS Code.
3. If prompted in the bottom right of VS Code, click "Reopen in Container". Otherwise, open the VS Code command palette and run `Remote-Containers: Reopen in Container`.
4. Wait for the build process to complete. You will now have a Docker container running. Your files are mounted into the container, so edits made through VS Code apply to the files on your local filesystem.
5. Open an in-editor terminal by selecting `Terminal > New Terminal` from the Menu Bar.
6. Run `npm install` to install dependecies.
7. Run `npm run dev` to start the server. All code changes will be hot reloaded.
8. Your server is available at `localhost:3000`. VS Code will automatically expose the port from the Dev Container to the rest of your machine.

### Option 2: Manually with NVM and NPM

If you're running in to performance issues running/building the app inside the Dev Container, another option is run the app locally via [NVM](https://github.com/nvm-sh/nvm).

1. Install `NVM`.
2. Open your preferred terminal and navigate to the project's root directory.
3. Run `nvm use`. This will install and activate the correct version of `NPM` and `Node` within your terminal session.
4. Run `npm install` to install dependecies.
5. Run `npm run dev` to start the server. All code changes will be hot reloaded.
6. Your server is available at `localhost:3000`.

### Ngrok

Now that you have the server running, you'll most likely want to set up `localhost:3000` with an `ngrok` proxy domain as detailed [here](https://nearinc.atlassian.net/wiki/spaces/DEVCONSOLE/pages/36438083/Onboarding).

# Contributing

## Modules

DevConsole consists of multiple modules owned by different teams within Pagoda. Each module has isolated directories within this repository for their work, and should refrain from touching files outside those directories.

The folders are:

- `/modules/{module}/`: This directory is instantiated with a few subdirectories for suggested organization, but it is entirely owned by the module team to use as they see fit. It should contain all non-page files necessary to build the module
- `/pages/{module}/`: Contains all pages to be rendered for this module as `.tsx` files. See the [Next.js Pages](https://nextjs.org/docs/basic-features/pages) doc for more information

#### Example

Given a module named `alerts` with the following files

```
/modules
  /alerts
    /utils
    /components
      AlertDetailCard.tsx
    /hooks
/pages
  /alerts
    index.tsx
    new-alert.tsx
```

Two pages will be available in the UI: `/alerts` and `/alerts/new-alert`. The page files `/pages/alerts/index.tsx` and `/pages/alerts/new-alert.tsx` will likely have the following import:

```
import { AlertDetailCard } from '@/modules/alerts/components/AlertDetailCard'
```

## Styles & Components

This project uses [Radix](https://www.radix-ui.com/) and [Stitches](https://stitches.dev/). We have built out a library of generic, reusable components in [components/lib](./components/lib). You can view all of these components by visiting `/ui` when running the server locally or on the [development server](https://dev.console.pagoda.co/ui). The `/ui` route is hidden in production.

View the [UI Library README](./components/lib/README.md) to learn more about our UI library, components, styling, and conventions.

## Page Layouts

Pages take advantage of the Next.js [layouts](https://nextjs.org/docs/basic-features/layouts) feature. Currently there are three layouts: `DashboardLayout`, `SimpleLayout`, and `SimpleLogoutLayout`. Choose a layout by setting the `getLayout` property to the appropriate hook from the [hooks/layouts.tsx](hooks/layouts.tsx) file.

```tsx
import type { NextPageWithLayout } from '@/utils/types';
import { useDashboardLayout } from '@/hooks/layouts';

const NewPage: NextPageWithLayout = () => {
  // page content
};

NewPage.getLayout = useDashboardLayout;

export default NewPage;
```

## Data Fetching

[SWR](https://swr.vercel.app/) is used heavily for data fetching. This library makes it easy to build a UI that melds quick loading from cached data with frequent revalidation fetches to make sure the UI stays up to date. It is highly recommended to read the SWR docs in their entirety and familiarize yourself with how it works and what options are available. Data fetchers are defined in [utils/fetchers.ts](utils/fetchers.ts)

## Path Alias

Next JS supports `tsconfig.json` path aliases out of the box. We've set up a root `@/` alias that will allow us to write `@/utils/abc.tsx` instead of `../../../utils/abc.tsx`. This alias should be preferred most of the time when referencing root folders like `utils`, `public`, or `components`.

## Date Formatting

For date formatting, we use [Luxon](https://moment.github.io/luxon).

## E2E Testing

Tests are written in [Playwright](https://playwright.dev). See `/tests/playwright` folder for examples. The tests are configurable via a `.env.test.local` file. To run this locally, you will need to copy `.env.test.local.example` and ask the team for the secrets.

The screenshot tests are used for testing tutorial pages that have dynamic content that could potentially change outside of our team (tests/playwright/snapshot/nft-tutorial-snapshot.spec.ts).

Note: playwright tests can only run on [specific OSes](https://playwright.dev/docs/library#system-requirements). This means we can't run it in the VS Code dev container. Currently, you must run this project on your host machine.

If you want to run these tests in your local on your host machine (this will not work in docker):

```bash
npm run test:e2e:local
```

```bash
npm run test:snapshot:local
```

then run `npm run test:e2e` for integration tests or `npm run test:snapshot` for snapshot tests.

### Initial console setup for e2e tests

Go to the url of the environment you want to test:

1. Setup a user with email and password. Store these in your `.env.test.local`.
2. Create a tutorial project. Copy the slug from the url and set `TEST_NFT_TUTORIAL_PROJECT` in `.env.test.local`. This is important for both e2e and snapshot tests.

## JWT Reveal

When running locally or in development (`NEXT_PUBLIC_DEPLOY_ENV` is `LOCAL` or `DEVELOPMENT`), you can easily grab the JWT for the current session by clicking on the Pagoda icon in the sidebar. This is useful for manual API testing through Postman.

## Comments

Where helpful, utilize [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) syntax to add context to your comments
