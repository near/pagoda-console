import { styled } from '@/styles/stitches';

export const Stack = styled('div', {
  display: 'flex',
  flexDirection: 'column',

  variants: {
    gap: {
      xs: {
        gap: 'var(--space-xs)',
      },
      s: {
        gap: 'var(--space-s)',
      },
      m: {
        gap: 'var(--space-m)',
      },
      l: {
        gap: 'var(--space-l)',
      },
      xl: {
        gap: 'var(--space-xl)',
      },
    },
  },

  defaultVariants: {
    gap: 'm',
  },
});
