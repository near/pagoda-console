// TODO (P2+) get copy button working cleanly for single line snippets so that it can be enabled

import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
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
                padding: '1rem 0.5rem'
            }} {...passedProps}>
                {children}
            </SyntaxHighlighter>
            <Button variant='outline-light' size="sm" onClick={copyKey} disabled={!isChildString}>
                <FontAwesomeIcon icon={faCopy} />
            </Button>
            <OverlayTrigger
                placement="top"
                trigger="click"
                rootClose={true}
                overlay={
                    <Tooltip>
                        Copied!
                    </Tooltip>
                }
            >
                <Button variant='outline-light' size="sm" onClick={copyKey} disabled={!isChildString}>
                    <FontAwesomeIcon icon={faCopy} />
                </Button>
            </OverlayTrigger>
            <style jsx>{`
                .codeContainer {
                    position: relative;
                }
                .codeContainer :global(.btn) {
                    position: absolute;
                    top: 0.25rem;
                    right: 0.25rem;
                    height: auto;
                }
            `}</style>
        </div >
    );
}

export default CodeBlock