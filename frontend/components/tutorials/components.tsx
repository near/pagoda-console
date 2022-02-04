import CodeBlock from "./CodeBlock";
import H2Anchor from "./H2Anchor";
import H3Anchor from "./H3Anchor";
import Note from "./Note";

// A component map between markdown syntax and custom JSX components.
// This allows customizing the markdown output while the leaving customizations outside of markdown itself.
// For more info: https://mdxjs.com/table-of-components/
const components = {
    h2: H2Anchor,
    h3: H3Anchor,
    code: CodeBlock,
    Info: Note,
    Tip: Note,
    Note: Note
};

export default components;