import type { ComponentProps, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import { Button } from '@/components/lib/Button';
import * as Popover from '@/components/lib/Popover';

import { Box } from '../Box';
import { FeatherIcon } from '../FeatherIcon';
import { Text } from '../Text';

type Props = ComponentProps<typeof SyntaxHighlighter> & {
  children: ReactNode;
};

export function CodeBlock({ children, customStyle, ...passedProps }: Props) {
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
          fontFamily: 'var(--font-code)',
          borderRadius: 'var(--border-radius-m)',
          padding: '1rem 3rem 1rem 1.2rem',
          ...customStyle,
        }}
        {...passedProps}
      >
        {children}
      </SyntaxHighlighter>

      <Popover.Root open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
        <Popover.Anchor asChild>
          <Button
            aria-label="Copy code to clipboard"
            color="neutral"
            size="s"
            onClick={copyCode}
            disabled={!isChildString}
            css={{
              position: 'absolute',
              top: '0rem',
              right: '0rem',
              background: 'transparent',
              boxShadow: 'none',
              borderRadius: '0 var(--border-radius-m) 0 var(--border-radius-m)',
              padding: '0 6px',
            }}
          >
            <FeatherIcon icon="copy" size="xs" />
          </Button>
        </Popover.Anchor>

        <Popover.Content side="top">
          <Text>Copied!</Text>
        </Popover.Content>
      </Popover.Root>
    </Box>
  );
}
