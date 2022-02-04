import OtherCodeBlock from '../CodeBlock';

export default function CodeBlock(props: any) {
    // className is the language used in the code block.
    // It's currently the only way for us to guess if the writer is using a single tick (`) vs three ticks (```).
    // Another way around this would be to call the component directly in Markdown.
    if (props.className) {
        return <OtherCodeBlock>{props.children}</OtherCodeBlock>;
    }
    return <code>{props.children}</code>;
}