import { styled } from '@/styles/theme';

export const Button = styled('button', {
  borderRadius: '$standard',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 500,
  fontFamily: '$body',
  padding: '0 $m',
  flexShrink: 0,
  transition: 'background 150ms',

  '&:focus': {
    outline: '1px solid',
    outlineOffset: '2px',
    outlineColor: '$gray500',
  },

  variants: {
    color: {
      primary: {
        background: '$green500',
        color: '$gray25',
        '&:hover': {
          background: '$green600',
        },
      },
      neutral: {
        background: '$gray700',
        color: '$gray25',
        '&:hover': {
          background: '$gray800',
        },
      },
    },

    size: {
      small: {
        fontSize: '$bodySmall',
        height: '$inputSmall',
      },
      standard: {
        fontSize: '$body',
        height: '$inputStandard',
        padding: '0 $m',
      },
    },
  },

  defaultVariants: {
    color: 'primary',
    size: 'standard',
  },
});
