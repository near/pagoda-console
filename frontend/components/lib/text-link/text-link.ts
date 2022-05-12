import { styled } from '@/styles/theme';

export const TextLink = styled('a', {
  display: 'inline-block',
  cursor: 'pointer',
  fontWeight: 700,
  fontFamily: '$body',
  transition: 'color 150ms',
  borderBottom: '1px solid',

  '&:focus': {
    outline: '1px solid',
    outlineOffset: '4px',
    outlineColor: '$gray500',
  },

  '&:active': {
    opacity: 0.8,
  },

  variants: {
    color: {
      primary: {
        color: '$green500',
        '&:hover': {
          color: '$green600',
        },
      },
      neutral: {
        color: '$gray800',
        '&:hover': {
          color: '$gray900',
        },
      },
    },
  },

  defaultVariants: {
    color: 'primary',
  },
});
