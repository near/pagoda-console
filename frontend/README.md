## **NEAR Developer Console Frontend**

# Stack

Language: Typescript

Framework: [Next.js](https://nextjs.org/)

UI Kit: [React Bootstrap](https://react-bootstrap.github.io/)

Identity Management: [Firebase Auth](https://firebase.google.com/docs/auth)

# Usage

## Local Environment Variables

Environment variables are loaded automatically from a `.env.local` file at the root of the project. This file is not currently tracked in git so you will need to obtain it from a fellow developer.

To make the environment variable available in the browser at runtime, it must be prefixed with `NEXT_PUBLIC_`

[Next.js Environment Variables docs](https://nextjs.org/docs/basic-features/environment-variables)

# Contributing

The recommended way to run a development instance of this project is with VS Code and Dev Containers. The container definitions are part of this repository (`.devcontainer/`), so using dev containers will allow you to easily keep your environment in sync with other team members.

If VS Code is not your preferred development environment, you are more than welcome to stray from this recommendation and run the containers with Docker directly.

## Config

All environment variables are read into a config object in [utils/config.ts](utils/config.ts). This allows casting the values to their desired types in a central location and early process termination if any values were not defined

## CSS-in-JS

This project uses [styled-jsx](https://github.com/vercel/styled-jsx). This remains open to evaluation. See [this issue](https://github.com/near/developer-console-framework/issues/7) for context

### Styling third party components with styled-jsx

To style third party components which do not accept a custom `className` (e.g. React Bootstrap components) with styled-jsx, it is necessary to use a child or descendent selector and a global class name.

```tsx
<div className='buttonContainer'>
    <Button>Click me</Button>
    <style jsx>{`
        .buttonContainer :global(.btn) {
            height: 3rem;
        }
    `}</style>
</div>
```

## Page Layouts

Pages take advantage of the Next.js [layouts](https://nextjs.org/docs/basic-features/layouts) feature. Currently there are two layouts: DashboardLayout and SimpleLayout. Choose a layout by setting the `getLayout` to the appropriate value from the [utils/layouts.tsx](utils/layouts.tsx) file

```tsx
import { useSimpleLayout } from "../utils/layouts";

export default function NewPage() {
    // page content
}

NewPage.getLayout = useSimpleLayout;
```

## Data Fetching

[SWR](https://swr.vercel.app/) is used heavily for data fetching. This library makes it easy to build a UI that melds quick loading from cached data with frequent revalidation fetches to make sure the UI stays up to date. It is highly recommended to read the SWR docs in their entirety and familiarize yourself with how it works and what options are available. Data fetchers are defined in [utils/fetchers.ts](utils/fetchers.ts)

## Comments

Where helpful, utilize [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) syntax to add context to your comments

## Editor

Important extensions

```
divlo.vscode-styled-jsx-syntax
```

## Getting Started

Run the development server:

```bash
npm run dev
```

View at [http://localhost:3000](http://localhost:3000)

## Tutorial Pages

Tutorial pages consist of 2 files per page. 

1. the .mdx file 
    * these are originally retrieved from the @near/docs project in Github. Download the .md file and change to .mdx.
    * you can find the nfts tutorial pages [here](https://github.com/near/docs/tree/master/docs/tutorials/contracts/nfts)
2. the .tsx file to load the markdown content and act as the next.js page

The goal is to eventually leave the .mdx file intact and use remark plugins, etc to transform the markdown to JSX components that we can plug into a next.js page. We could go as far as processing the tutorial pages like docusaurus and build the whole tutorial section programmatically.

For ETHDenver, it was easier to get MDX v2 working (without plugins) in the next.js project. This requires some changes to the .mdx file to get the page to look correctly. Currently @near/docs uses docusaurus which uses MDX v1. There is an issue on docusaurus to evaluate upgrading or moving to another project here: https://github.com/facebook/docusaurus/issues/4029. We will evaluate moving to MDX v1 after ETHDenver.

Here are the changes that need to occur to each .md file that comes from @near/docs:

* Remove <!-- --> html comments or comment them in JSX
    * html comments are valid in mdx v1 but not in v2
    * In v2, you will get a compile error that says ! is not allowed
* Create a top h1 using # in markdown
    * the title can be found in the frontmatter at the top of the file
* Remove frontmatter. This is the --- section at the top of each file.
* Replace :::note, :::tip, etc with the applicable JSX component
    :::note -> <Note></Note>
    :::tip -> <Tip></Tip>
    :::info -> <Info></Info>
* Replace urls as necessary to match routes in the DC
    * Any relative or absolute links will need to be updated
* Acorn # in headers need to be removed
    e.g. ## Viewing NFTs in the wallet {#viewing-nfts-in-wallet}
    the {#...} needs to be removed
* Search for <details> tags and make sure no ``` code blocks are inside of <p> tags, if they are, remove the <p> surrounding the code block.
* Replace ```sh with ```bash
* MDX isn't formatting ``` and <code> the same way so replace <code> with ``` if needed to get the styling

V2 docs: https://mdxjs.com/
V1 docs: https://v1.mdxjs.com/