import OtherCodeBlock from '../CodeBlock';

export default function CodeBlock(props: any) {
    // className is the language used in the code block.
    // It's currently the only way for us to guess if the writer is using a single tick (`) vs three ticks (```).
    // Another way around this would be to call the component directly in Markdown.
    if (props.className) {
        let content;
        if (typeof props.children === 'string' && props.children.endsWith('\n')) {
            content = props.children.slice(0, props.children.length - 1);
        } else {
            content = props.children;
        }
        return <OtherCodeBlock>{content}</OtherCodeBlock>;
    }
    return <code>{props.children}</code>;
}