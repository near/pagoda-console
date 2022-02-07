import { Table } from "react-bootstrap";
import CodeBlock from "./CodeBlock";
import { H1Anchor, H2Anchor, H3Anchor } from "./Anchors";
import Note from "./Note";

// A component map between markdown syntax and custom JSX components.
// This allows customizing the markdown output while the leaving customizations outside of markdown itself.
// For more info: https://mdxjs.com/table-of-components/
const components = {
    h1: H1Anchor,
    h2: H2Anchor,
    h3: H3Anchor,
    code: CodeBlock,
    Info: (props: any) => {
        return <Note type="info">{props.children}</Note>;
    },
    Tip: (props: any) => {
        return <Note type="tip">{props.children}</Note>;
    },
    Note: Note,
    Table: (props: any) => {
        return <Table striped bordered hover responsive style={{ marginBottom: '1rem', backgroundColor: 'var(--color-white)' }}>{props.children}</Table>
    }
};

export default components;