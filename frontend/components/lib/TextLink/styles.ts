import { styled } from '@/styles/stitches';

export const TextLink = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  cursor: 'pointer',
  fontWeight: 500,
  fontFamily: 'var(--font-action)',
  transition: 'var(--transitions)',
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
        borderBottom: 'none',
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
      s: {
        fontSize: 'var(--font-size-body-small)',
        fontWeight: 400,
      },

      m: {
        fontSize: 'var(--font-size-body)',
      },
    },
  },

  defaultVariants: {
    color: 'primary',
  },
});
