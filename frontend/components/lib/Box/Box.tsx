import { styled } from '@/styles/stitches';

export const Box = styled('div', {
  variants: {
    padding: {
      none: {
        padding: '0rem',
      },
      s: {
        padding: 'var(--space-s)',
      },
      m: {
        padding: 'var(--space-m)',
      },
      l: {
        padding: 'var(--space-l)',
      },
      xl: {
        padding: 'var(--space-xl)',
      },
    },
  },

  defaultVariants: {
    padding: 'none',
  },
});
