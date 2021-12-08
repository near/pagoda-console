import { FC, ReactNode } from "react";
import { LightAsync as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const CodeBlock: FC<SyntaxHighlighterProps> = function ({ children, ...passedProps }) {
    return (
        <SyntaxHighlighter style={atomOneDark} customStyle={{ borderRadius: '0.5rem' }} {...passedProps}>
            {children}
        </SyntaxHighlighter>
    );
}

export default CodeBlock