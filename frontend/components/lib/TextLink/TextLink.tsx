import { styled } from '@/styles/stitches';

export const TextLink = styled('a', {
  display: 'inline-block',
  cursor: 'pointer',
  fontWeight: 700,
  fontFamily: 'var(--font-body)',
  transition: 'color var(--transition-speed)',
  borderBottom: '1px solid',
  whiteSpace: 'nowrap',

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: '4px',
  },

  '&:active': {
    opacity: 0.8,
  },

  variants: {
    color: {
      danger: {
        color: 'var(--color-cta-danger)',
        '&:hover': {
          color: 'var(--color-cta-danger-highlight)',
        },
      },
      primary: {
        color: 'var(--color-cta-primary)',
        '&:hover': {
          color: 'var(--color-cta-primary-highlight)',
        },
      },
      neutral: {
        color: 'var(--color-text-1)',
        '&:hover': {
          color: 'var(--color-text-2)',
        },
      },
    },

    size: {
      small: {
        fontSize: 'var(--font-size-body-small)',
        fontWeight: 400,
      },
    },
  },

  defaultVariants: {
    color: 'primary',
  },
});
