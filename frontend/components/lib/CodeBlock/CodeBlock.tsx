import type { ComponentProps, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import { Button } from '@/components/lib/Button';
import * as Popover from '@/components/lib/Popover';
import { useTheme } from '@/hooks/theme';
import type { StitchesCSS } from '@/styles/stitches';

import { Box } from '../Box';
import { FeatherIcon } from '../FeatherIcon';
import { Text } from '../Text';

type Props = ComponentProps<typeof SyntaxHighlighter> & {
  children: ReactNode;
  css?: StitchesCSS;
  onPaste?: (event: any) => void;
};

export function CodeBlock({ children, css, customStyle, onPaste, ...passedProps }: Props) {
  const { activeTheme } = useTheme();
  const isChildString = typeof children === 'string';
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [showPastedAlert, setShowPastedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();
  const pastedTimer = useRef<NodeJS.Timeout>();
  const codeTheme = activeTheme === 'dark' ? atomOneDark : atomOneLight;

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

  function pasteCode(event: any) {
    if (pastedTimer.current) {
      clearTimeout(pastedTimer.current);
    }

    if (onPaste) onPaste(event);
    setShowPastedAlert(true);
    pastedTimer.current = setTimeout(() => {
      setShowPastedAlert(false);
    }, 2000);
  }

  return (
    <Box
      css={{
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--border-radius-m)',
        background: 'var(--color-surface-1)',
        overflow: 'auto',
        ...css,
      }}
    >
      <SyntaxHighlighter
        style={codeTheme}
        customStyle={{
          fontFamily: 'var(--font-code)',
          borderRadius: 'var(--border-radius-m)',
          padding: '1rem 3rem 1rem 1.2rem',
          background: 'none',
          border: '1px solid var(--color-border-1)',
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
              borderRadius: '0',
              padding: '0 6px',

              '&:hover, &:focus': {
                background: 'var(--color-surface-overlay)',
                outline: 'none',
              },
            }}
          >
            <FeatherIcon icon="copy" size="xs" />
          </Button>
        </Popover.Anchor>

        <Popover.Content side="top">
          <Text>Copied!</Text>
        </Popover.Content>
      </Popover.Root>

      {onPaste && (
        <Popover.Root open={showPastedAlert} onOpenChange={setShowPastedAlert}>
          <Popover.Anchor asChild>
            <Button
              aria-label="Paste code to clipboard"
              color="neutral"
              size="s"
              onClick={pasteCode}
              css={{
                position: 'absolute',
                top: '0rem',
                right: '1.5rem',
                background: 'transparent',
                boxShadow: 'none',
                borderRadius: '0 0 0 var(--border-radius-m)',
                padding: '0 6px',

                '&:hover': {
                  background: 'var(--color-surface-overlay)',
                },
              }}
            >
              <FeatherIcon icon="clipboard" size="xs" />
            </Button>
          </Popover.Anchor>

          <Popover.Content side="top">
            <Text>Pasted!</Text>
          </Popover.Content>
        </Popover.Root>
      )}
    </Box>
  );
}
