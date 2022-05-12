import { styled } from '@/styles/theme';

export const Section = styled('section', {
  padding: '$l',
  borderBottom: '1px solid',
  borderColor: '$gray100',

  '&:last-child': {
    borderBottom: 'none',
  },

  '@mobile': {
    padding: '$m',
  },

  variants: {
    color: {
      primary: {
        background: '$gray50',
        border: 'none',
      },
    },

    noBorder: {
      true: {
        borderBottom: 'none',
      },
    },
  },
});
