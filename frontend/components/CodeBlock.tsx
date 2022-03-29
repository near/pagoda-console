import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useRef, useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

export default function CodeBlock({ children, ...passedProps }: { children: ReactNode; language: string }) {
  const isChildString = typeof children === 'string';

  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();

  function copyKey() {
    if (copiedTimer.current) {
      clearTimeout(copiedTimer.current);
    }

    isChildString && navigator.clipboard.writeText(children);

    setShowCopiedAlert(true);
    copiedTimer.current = setTimeout(() => {
      setShowCopiedAlert(false);
    }, 2000);
  }

  return (
    <div className="codeContainer">
      <SyntaxHighlighter
        style={atomOneDark}
        customStyle={{
          borderRadius: '0.5rem',
          padding: '1rem 3rem 1rem 0.5rem',
        }}
        {...passedProps}
      >
        {children}
      </SyntaxHighlighter>
      <Button variant="outline-light" size="sm" onClick={copyKey} disabled={!isChildString}>
        <FontAwesomeIcon icon={faCopy} />
      </Button>
      <OverlayTrigger
        show={showCopiedAlert}
        placement="top"
        trigger="click"
        rootClose={true}
        overlay={<Tooltip>Copied!</Tooltip>}
      >
        <Button variant="outline-light" size="sm" onClick={copyKey} disabled={!isChildString}>
          <FontAwesomeIcon icon={faCopy} />
        </Button>
      </OverlayTrigger>
      <style jsx>{`
        .codeContainer {
          position: relative;
          font-size: var(--bs-body-font-size);
        }
        .codeContainer :global(.btn) {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          height: auto;
        }
      `}</style>
    </div>
  );
}
