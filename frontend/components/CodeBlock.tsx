// TODO (P2+) get copy button working cleanly for single line snippets so that it can be enabled

import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactNode } from "react";
import { Button } from "react-bootstrap";
import { LightAsync as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const CodeBlock: FC<SyntaxHighlighterProps> = function ({ children, ...passedProps }) {
    const isChildString = typeof children === 'string';
    function copyKey() {
        isChildString && navigator.clipboard.writeText(children);
    }
    return (
        <div className="codeContainer">
            <SyntaxHighlighter style={atomOneDark} customStyle={{
                borderRadius: '0.5rem',
                // padding: '1rem 3rem 1rem 0.5rem' // for copy button
                padding: '1rem 0.5rem 1rem'
            }} {...passedProps}>
                {children}
            </SyntaxHighlighter>
            {/* <Button variant='outline-primary' onClick={copyKey} disabled={!isChildString}>
                <FontAwesomeIcon icon={faCopy} />
            </Button> */}
            {/* <style jsx>{`
                .codeContainer {
                    position: relative;
                }
                .codeContainer :global(.btn){
                    position: absolute;
                    top: 0.25rem;
                    right: 0.25rem;
                    z-index: 2;
                }
            `}</style> */}
        </div >
    );
}

export default CodeBlock