import { styled } from '@/styles/stitches';

export const Button = styled('button', {
  borderRadius: 'var(--border-radius)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 500,
  fontFamily: 'var(--font-body)',
  padding: '0 var(--space-m)',
  flexShrink: 0,
  transition: 'background var(--transition-speed)',

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  variants: {
    color: {
      danger: {
        background: 'var(--color-cta-danger)',
        color: 'var(--color-cta-danger-text)',
        '&:hover': {
          background: 'var(--color-cta-danger-highlight)',
        },
        '&:active': {
          background: 'var(--color-cta-danger)',
        },
      },
      primary: {
        background: 'var(--color-cta-primary)',
        color: 'var(--color-cta-primary-text)',
        '&:hover': {
          background: 'var(--color-cta-primary-highlight)',
        },
        '&:active': {
          background: 'var(--color-cta-primary)',
        },
      },
      neutral: {
        background: 'var(--color-cta-neutral)',
        color: 'var(--color-cta-neutral-text)',
        '&:hover': {
          background: 'var(--color-cta-neutral-highlight)',
        },
        '&:active': {
          background: 'var(--color-cta-neutral)',
        },
      },
    },

    size: {
      small: {
        fontSize: 'var(--font-size-body-small)',
        height: 'var(--size-input-small)',
      },
      standard: {
        fontSize: 'var(--font-size-body)',
        height: 'var(--size-input-standard)',
      },
    },
  },

  defaultVariants: {
    color: 'primary',
    size: 'standard',
  },
});
