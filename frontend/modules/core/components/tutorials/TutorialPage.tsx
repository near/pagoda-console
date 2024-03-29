import type { ReactNode } from 'react';

import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';

interface Props {
  children: ReactNode;
  sidebar: ReactNode;
}

export function TutorialPage(props: Props) {
  return (
    <Section>
      <Flex gap="l">
        <Flex
          stack
          css={{
            overflow: 'hidden',

            pre: {
              width: '100%',
            },

            ol: {
              maxWidth: '100%',
              listStyle: 'number outside',
              paddingLeft: '2rem',
            },

            ul: {
              maxWidth: '100%',
              listStyle: 'disc outside',
              paddingLeft: '2rem',
            },

            'ol li': {
              marginBottom: '1rem',
            },

            'ol li > *': {
              marginBottom: '1rem',
            },

            hr: {
              width: '100%',
              height: '1px',
              background: 'var(--color-border-1)',
              marginTop: 'var(--space-l)',
            },

            'th, td': {
              padding: 'var(--space-s)',
              background: 'var(--color-surface-1)',
              borderRight: '2px solid var(--color-border-1)',

              '&:last-child': {
                borderRight: 'none',
              },
            },

            'tr:nth-child(odd) td': {
              background: 'var(--color-surface-2)',
            },

            th: {
              fontWeight: 600,
              whiteSpace: 'nowrap',
              borderBottom: '2px solid var(--color-border-1)',
            },
          }}
        >
          {props.children}
        </Flex>

        {props.sidebar}
      </Flex>
    </Section>
  );
}
