import { styled } from '@/styles/stitches';

export const HR = styled('hr', {
  width: '100%',
  height: '1px',

  variants: {
    color: {
      border1: {
        background: 'var(--color-border-1)',
      },
      border2: {
        background: 'var(--color-border-2)',
      },
      warning: {
        background: 'var(--color-warning)',
      },
    },
    margin: {
      zero: {
        margin: '0',
      },
      s: {
        margin: '0.75rem 0',
      },
      m: {
        margin: '1.5rem 0',
      },
      xl: {
        margin: '5rem 0',
      },
    },
  },

  defaultVariants: {
    color: 'border1',
  },
});
