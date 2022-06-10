import { styled } from '@/styles/stitches';

export const Section = styled('section', {
  width: '100%',
  padding: 'var(--space-l)',
  background: 'var(--color-surface-1)',
  borderBottom: '1px solid var(--color-border-1)',

  '&:last-child': {
    borderBottom: 'none',
  },

  '@mobile': {
    padding: 'var(--space-m)',
  },

  variants: {
    background: {
      surface1: {
        background: 'var(--color-surface-1)',
      },
      surface2: {
        background: 'var(--color-surface-2)',
      },
      surface3: {
        background: 'var(--color-surface-3)',
      },
      surface4: {
        background: 'var(--color-surface-4)',
      },
    },

    noBorder: {
      true: {
        borderBottom: 'none',
      },
    },
  },

  defaultVariants: {
    background: 'surface3',
  },
});
