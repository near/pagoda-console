import { styled } from '@/styles/stitches';

export const Section = styled('section', {
  padding: 'var(--space-l)',
  background: 'var(--color-surface-1)',
  borderBottom: '2px solid var(--color-surface-3)',

  '&:last-child': {
    borderBottom: 'none',
  },

  '@mobile': {
    padding: 'var(--space-m)',
  },

  variants: {
    color: {
      surface1: {
        background: 'var(--color-surface-1)',
      },
      surface2: {
        background: 'var(--color-surface-2)',
      },
    },

    noBorder: {
      true: {
        borderBottom: 'none',
      },
    },
  },

  defaultVariants: {
    color: 'surface1',
  },
});
