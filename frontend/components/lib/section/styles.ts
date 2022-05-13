import { styled } from '@/styles/stitches';

export const Section = styled('section', {
  padding: 'var(--space-l)',
  borderBottom: '2px solid var(--color-surface-3)',

  '&:last-child': {
    borderBottom: 'none',
  },

  '@mobile': {
    padding: 'var(--space-m)',
  },

  variants: {
    color: {
      primary: {
        background: 'var(--color-surface-2)',
      },
    },

    noBorder: {
      true: {
        borderBottom: 'none',
      },
    },
  },
});
