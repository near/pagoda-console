## **Pagoda Developer Console Frontend**

View at [http://console.near.dev]

# Stack

Language: Typescript

Framework: [Next.js](https://nextjs.org/)

UI Kit: [React Bootstrap](https://react-bootstrap.github.io/)

Identity Management: [Firebase Auth](https://firebase.google.com/docs/auth)

# Usage

## Local Environment Variables

Environment variables are loaded automatically from a `.env.local` file at the root of the project. Please copy the `.env.local.example` file as a starting point and ask the team for the secrets.

To make the environment variable available in the browser at runtime, it must be prefixed with `NEXT_PUBLIC_`

[Next.js Environment Variables docs](https://nextjs.org/docs/basic-features/environment-variables)

# Contributing

The recommended way to run a development instance of this project is with VS Code and Dev Containers via the `ms-azuretools.vscode-docker` extension (which you will need to install manually). The container definitions are part of this repository (`.devcontainer/`), so using dev containers will allow you to easily keep your environment in sync with other team members.

If VS Code is not your preferred development environment, you are more than welcome to stray from this recommendation and run the containers with Docker directly.

If you're running in to performance issues running/building the app inside the Dev Container, another option is run the app outside of it via `NVM`. Simply install `NVM` and then run `nvm use` in the project's root directory.

## Getting Started

Run the development server:

```bash
npm run dev
```

View at [http://localhost:3000](http://localhost:3000)

## JWT Reveal

When running locally or in development (`NEXT_PUBLIC_DEPLOY_ENV` is `LOCAL` or `DEVELOPMENT`), you can easily grab the JWT for the current session by clicking on the Pagoda icon in the sidebar. This is useful for manual API testing through Postman.

## Config

All environment variables are read into a config object in [utils/config.ts](utils/config.ts). This allows casting the values to their desired types in a central location and early process termination if any values were not defined

## CSS-in-JS

This project uses [styled-jsx](https://github.com/vercel/styled-jsx). This remains open to evaluation. See [this issue](https://github.com/near/developer-console-framework/issues/7) for context

### Styling third party components with styled-jsx

To style third party components which do not accept a custom `className` (e.g. React Bootstrap components) with styled-jsx, it is necessary to use a child or descendent selector and a global class name.

```tsx
<div className="buttonContainer">
  <Button>Click me</Button>
  <style jsx>{`
    .buttonContainer :global(.btn) {
      height: 3rem;
    }
  `}</style>
</div>
```

## Page Layouts

Pages take advantage of the Next.js [layouts](https://nextjs.org/docs/basic-features/layouts) feature. Currently there are three layouts: DashboardLayout, SimpleLayout, and SimpleLogoutLayout. Choose a layout by setting the `getLayout` property to the appropriate hook from the [hooks/layouts.tsx](hooks/layouts.tsx) file.

```tsx
import type { NextPageWithLayout } from '@/utils/types';
import { useSimpleLayout } from '@/hooks/layouts';

const NewPage: NextPageWithLayout = () => {
  // page content
};

NewPage.getLayout = useSimpleLayout;

export default NewPage;
```

## Data Fetching

[SWR](https://swr.vercel.app/) is used heavily for data fetching. This library makes it easy to build a UI that melds quick loading from cached data with frequent revalidation fetches to make sure the UI stays up to date. It is highly recommended to read the SWR docs in their entirety and familiarize yourself with how it works and what options are available. Data fetchers are defined in [utils/fetchers.ts](utils/fetchers.ts)

## Comments

Where helpful, utilize [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) syntax to add context to your comments

## Path Alias

Next JS supports `tsconfig.json` path aliases out of the box. We've set up a root `@/` alias that will allow us to write `@/utils/abc.tsx` instead of `../../../utils/abc.tsx`. This alias should be preferred most of the time when referencing root folders like `utils`, `public`, or `components`.

## Tutorial Pages

Tutorial pages consist of 2 files per page.

1. the .mdx file
   - these are originally retrieved from the @near/docs project in Github. Download the .md file and change to .mdx.
   - you can find the nfts tutorial pages [here](https://github.com/near/docs/tree/master/docs/tutorials/contracts/nfts)
2. the .tsx file to load the markdown content and act as the next.js page

The goal is to eventually leave the .mdx file intact and use remark plugins, etc to transform the markdown to JSX components that we can plug into a next.js page. We could go as far as processing the tutorial pages like docusaurus and build the whole tutorial section programmatically.

For ETHDenver, it was easier to get MDX v2 working (without plugins) in the next.js project. This requires some changes to the .mdx file to get the page to look correctly. Currently @near/docs uses docusaurus which uses MDX v1. There is an issue on docusaurus to evaluate upgrading or moving to another project here: https://github.com/facebook/docusaurus/issues/4029. We will evaluate moving to MDX v1 after ETHDenver.

Here are the changes that need to occur to each .md file that comes from @near/docs:

- Remove `<!-- -->` html comments or comment them in JSX
  - html comments are valid in mdx v1 but not in v2
  - In v2, you will get a compile error that says ! is not allowed
- Create a top h1 using `#` in markdown
  - the title can be found in the frontmatter at the top of the file
- Remove frontmatter. This is the `---` section at the top of each file.
- Replace `:::note`, `:::tip`, etc with the applicable JSX component
  ```
  :::note -> <Note></Note>
  :::tip -> <Tip></Tip>
  :::info -> <Info></Info>
  ```
- Replace tables with `<Table>` component. Any html elements in the table like `<a>` or `<code>` tags will not use the `components.tsx` mapping. Html elements should either directly call the component within the `components.tsx` mapping or use markdown syntax.
- Replace urls as necessary to match routes in the DC
  - Any relative or absolute links will need to be updated
  - image links that are used with `![` may need to be updated
    - you may also be able to search for `/docs/assets`
  - links that start with `](/docs/tutorials/contracts` may just need to be updated to `](/tutorials`
  - remaining links that start with `](/docs/` may need to be changed to `](https://docs.near.org/docs/`
  - any links that start with `](#` and contain a `.`, remove the `.`
- Acorn `#` in headers need to be removed
  e.g. In `## Viewing NFTs in the wallet {#viewing-nfts-in-wallet}`, the `{#...}` needs to be removed
- Search for `<details>` tags and make sure no ` ``` ` code blocks are inside of `<p>` tags, if they are, remove the `<p>` surrounding the code block.
- Replace ` ```sh ` with ` ```bash `
- MDX isn't formatting ` ``` ` and `<code>` the same way so replace `<code>` with ` ``` `, if needed, to get the styling

V2 docs: https://mdxjs.com/
V1 docs: https://v1.mdxjs.com/

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
