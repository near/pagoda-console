import type { ReactNode } from 'react';

import { Flex } from '../lib/Flex';
import { Section } from '../lib/Section';

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
              listStyle: 'number outside',
              marginLeft: '1rem',
            },

            ul: {
              listStyle: 'disc outside',
              marginLeft: '1rem',
            },

            hr: {
              width: '100%',
              height: '1px',
              background: 'var(--color-surface-1)',
              marginTop: 'var(--space-l)',
            },

            'th, td': {
              padding: 'var(--space-s)',
              background: 'var(--color-surface-1)',
              borderRight: '2px solid var(--color-surface-3)',

              '&:last-child': {
                borderRight: 'none',
              },
            },

            'tr:nth-child(odd) td': {
              background: 'var(--color-surface-2)',
            },

            th: {
              fontWeight: 700,
              borderBottom: '2px solid var(--color-surface-3)',
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
