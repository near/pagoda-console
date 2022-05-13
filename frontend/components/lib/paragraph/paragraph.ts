import { styled } from '@/styles/stitches';

export const P = styled('p', {
  color: 'var(--color-text-2)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  lineHeight: 'var(--line-height-body)',

  variants: {
    size: {
      small: {
        fontSize: 'var(--font-size-body-small)',
      },
      standard: {
        fontSize: 'var(--font-size-body)',
      },
      large: {
        fontSize: 'var(--font-size-h4)',
      },
    },
  },

  defaultVariants: {
    size: 'standard',
  },
});
