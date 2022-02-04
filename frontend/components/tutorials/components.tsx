import H2Anchor from "./H2Anchor";

// A component map between markdown syntax and custom JSX components.
// This allows customizing the markdown output while the leaving customizations outside of markdown itself.
// For more info: https://mdxjs.com/table-of-components/
const components = {
    h2: H2Anchor,
    // TODO add proper code blocks here
    // code: (props: any) => {
    //     // console.log('code block', props.children, props.className === 'language-rust', props.className === 'language-bash');
    //     return <code>{props.children}</code>;
    // },
    // Info: (props: any) => {
    //     <p>props.children</p>;
    // },
    // Tip: (props: any) => {
    //     <p>props.children</p>;
    // }
};

export default components;