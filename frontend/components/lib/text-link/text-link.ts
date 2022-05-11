import { styled } from '@/styles/theme';

export const TextLink = styled('a', {
  display: 'inline-block',
  cursor: 'pointer',
  fontWeight: 700,
  fontFamily: '$body',
  transition: 'border-color 150ms',
  borderBottom: '1px solid transparent',

  '&:hover, &:focus': {
    borderBottomColor: 'CurrentColor',
  },

  '&:active': {
    opacity: 0.8,
  },

  variants: {
    color: {
      primary: {
        color: '$brandPrimary',
      },
      secondary: {
        color: '$text3',
      },
    },
  },

  defaultVariants: {
    color: 'primary',
  },
});
