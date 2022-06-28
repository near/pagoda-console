# Tutorials

The current implementation of tutorials will most likely be deprecated and replaced in the near future with project templates and interactive tutorials. The following documentation can be considered legacy.

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
