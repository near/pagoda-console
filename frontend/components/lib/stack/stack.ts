import { styled } from '@/styles/theme';

export const Stack = styled('div', {
  display: 'flex',
  flexDirection: 'column',

  variants: {
    gap: {
      xs: {
        gap: '$xs',
      },
      s: {
        gap: '$s',
      },
      m: {
        gap: '$m',
      },
      l: {
        gap: '$l',
      },
      xl: {
        gap: '$xl',
      },
    },
  },

  defaultVariants: {
    gap: 'm',
  },
});
