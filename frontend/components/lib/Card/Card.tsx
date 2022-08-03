import { styled } from '@/styles/stitches';

export const Card = styled('div', {
  width: '100%',
  background: 'var(--color-surface-2)',
  transition: 'var(--transitions)',

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },

  variants: {
    border: {
      true: {
        background: 'transparent',
        border: '1px solid var(--color-border-2)',
      },
    },

    borderRadius: {
      s: {
        borderRadius: 'var(--border-radius-s)',
      },
      m: {
        borderRadius: 'var(--border-radius-m)',
      },
      l: {
        borderRadius: 'var(--border-radius-l)',
      },
      xl: {
        borderRadius: 'var(--border-radius-xl)',
      },
    },

    clickable: {
      true: {
        cursor: 'pointer',

        '&:hover': {
          background: 'var(--color-surface-1)',
        },

        '&:focus': {
          outline: 'var(--focus-outline)',
          outlineOffset: 'var(--focus-outline-offset)',
          boxShadow: 'var(--shadow-softer)',
        },
      },
    },

    padding: {
      s: {
        padding: 'var(--space-s)',
      },
      m: {
        padding: 'var(--space-m)',
      },
      l: {
        padding: 'var(--space-l)',
      },
      xl: {
        padding: 'var(--space-xl)',
      },
    },
  },

  defaultVariants: {
    borderRadius: 'l',
    padding: 'l',
  },
});
