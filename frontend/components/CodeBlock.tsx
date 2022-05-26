import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import { Button } from '@/components/lib/Button';
import * as Popover from '@/components/lib/Popover';

import { Box } from './lib/Box';
import { FeatherIcon } from './lib/FeatherIcon';
import { P } from './lib/Paragraph';

export default function CodeBlock({ children, ...passedProps }: { children: ReactNode; language: string }) {
  const isChildString = typeof children === 'string';

  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();

  function copyCode() {
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
    <Box
      css={{
        position: 'relative',
        width: '100%',
      }}
    >
      <SyntaxHighlighter
        style={atomOneDark}
        customStyle={{
          borderRadius: '8px',
          padding: '1rem 3rem 1rem 1.2rem',
        }}
        {...passedProps}
      >
        {children}
      </SyntaxHighlighter>

      <Popover.Root open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
        <Popover.Anchor asChild>
          <Button
            color="neutral"
            size="small"
            onClick={copyCode}
            disabled={!isChildString}
            css={{
              position: 'absolute',
              top: '0rem',
              right: '0rem',
              background: 'transparent',
              boxShadow: 'none',
              borderRadius: '0 8px 0 8px',
              padding: '0 6px',
            }}
          >
            <FeatherIcon icon="copy" size="xs" />
          </Button>
        </Popover.Anchor>

        <Popover.Content side="top">
          <P>Copied!</P>
        </Popover.Content>
      </Popover.Root>
    </Box>
  );
}
