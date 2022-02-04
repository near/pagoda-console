import { Alert } from "react-bootstrap";
import H2Anchor from "./H2Anchor";
import H3Anchor from "./H3Anchor";

// A component map between markdown syntax and custom JSX components.
// This allows customizing the markdown output while the leaving customizations outside of markdown itself.
// For more info: https://mdxjs.com/table-of-components/
const components = {
    h2: H2Anchor,
    h3: H3Anchor,
    // TODO add proper code blocks here
    // code: (props: any) => {
    //     // console.log('code block', props.children, props.className === 'language-rust', props.className === 'language-bash');
    //     return <code>{props.children}</code>;
    // },
    Info: (props: any) => {
        return <Alert>{props.children}</Alert>;
    },
    Tip: (props: any) => {
        return <Alert>{props.children}</Alert>;
    },
    Note: (props: any) => {
        return <Alert>{props.children}</Alert>;
    }
};

export default components;