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
  transition: 'opacity 150ms',

  '&:hover': {
    opacity: 0.9,
  },

  '&:active': {
    opacity: 0.8,
  },

  '&:focus': {
    boxShadow: '$focusDark',
  },

  variants: {
    color: {
      primary: {
        background: '$brandPrimary',
        color: '$surface1',
      },
      secondary: {
        background: '$text2',
        color: '$surface1',
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
