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
    background: {
      none: {
        background: '',
      },
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
  },

  defaultVariants: {
    padding: 'none',
    background: 'none',
  },
});
