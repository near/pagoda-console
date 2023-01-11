import { styled } from '@/styles/stitches';

export const Badge = styled('span', {
  display: 'inline-flex',
  gap: 'var(--space-s)',
  alignItems: 'center',
  flexShrink: 0,
  padding: 'var(--space-xs) var(--space-s)',
  borderRadius: '100px',
  fontSize: 'var(--font-size-body)',
  fontWeight: 400,
  fontFamily: 'var(--font-action)',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  transition: 'var(--transitions)',

  variants: {
    background: {
      light: {
        background: 'var(--color-cta-neutral)',
      },
      dark: {
        background: 'var(--color-surface-1)',
      },
    },
    gap: {
      none: {
        gap: '0rem',
      },
      xs: {
        gap: 'var(--space-xs)',
      },
      s: {
        gap: 'var(--space-s)',
      },
    },
    clickable: {
      true: {
        cursor: 'pointer',

        '&:disabled': {
          opacity: 0.5,
          pointerEvents: 'none',
        },
        '&:focus': {
          outline: 'var(--focus-outline)',
          outlineOffset: 'var(--focus-outline-offset)',
        },
        '&:hover': {
          background: 'var(--color-cta-neutral-highlight)',
        },
      },
    },

    color: {
      neutral: {
        color: 'var(--color-cta-neutral-text)',
      },

      primary: {
        color: 'var(--color-primary)',
      },

      danger: {
        color: 'var(--color-danger)',
      },

      warning: {
        color: 'var(--color-warning)',
      },
    },

    size: {
      m: {
        fontSize: 'var(--font-size-body)',
      },
      s: {
        fontSize: 'var(--font-size-body-small)',
      },
    },
  },

  defaultVariants: {
    color: 'neutral',
    size: 'm',
  },
});
