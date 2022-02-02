import H2Anchor from "./H2Anchor";

// A component map between markdown syntax and custom JSX components.
// This allows customizing the markdown output while the leaving customizations outside of markdown itself.
// For more info: https://mdxjs.com/table-of-components/
const components = {
    h2: ({ children }: { children: any }) => <H2Anchor>{children}</H2Anchor>
};

export default components;