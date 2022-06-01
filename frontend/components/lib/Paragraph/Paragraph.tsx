import { styled } from '@/styles/stitches';

export const P = styled('p', {
  color: 'var(--color-text-2)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  lineHeight: 'var(--line-height-body)',

  variants: {
    size: {
      s: {
        fontSize: 'var(--font-size-body-small)',
      },
      m: {
        fontSize: 'var(--font-size-body)',
      },
      l: {
        fontSize: 'var(--font-size-h4)',
      },
    },
  },

  defaultVariants: {
    size: 'm',
  },
});
