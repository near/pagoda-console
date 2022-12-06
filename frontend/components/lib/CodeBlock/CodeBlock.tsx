import type { ComponentProps, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import { Button } from '@/components/lib/Button';
import * as Popover from '@/components/lib/Popover';
import { useTheme } from '@/hooks/theme';
import type { StitchesCSS } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

import { Box } from '../Box';
import { FeatherIcon } from '../FeatherIcon';
import { Text } from '../Text';

type Props = ComponentProps<typeof SyntaxHighlighter> & {
  children: ReactNode;
  css?: StitchesCSS;
};

export function CodeBlock({ children, css, customStyle, ...passedProps }: Props) {
  const { activeTheme } = useTheme();
  const isChildString = typeof children === 'string';
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();
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

  return (
    <Box
      css={{
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--border-radius-m)',
        background: 'var(--color-surface-3)',
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
          ...customStyle,
        }}
        {...passedProps}
      >
        {children}
      </SyntaxHighlighter>

      <Popover.Root open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
        <Popover.Anchor asChild>
          <Button
            stableId={StableId.CODE_BLOCK_COPY_BUTTON}
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
    </Box>
  );
}
