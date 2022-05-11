import { styled } from '@/styles/theme';

export const P = styled('p', {
  color: '$text2',
  fontFamily: '$body',
  fontWeight: 400,
  lineHeight: '$body',

  variants: {
    size: {
      small: {
        fontSize: '$bodySmall',
      },
      standard: {
        fontSize: '$body',
      },
      large: {
        fontSize: '$h4',
      },
    },
  },

  defaultVariants: {
    size: 'standard',
  },
});
