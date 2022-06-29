import { styled } from '@/styles/stitches';

export const Badge = styled('span', {
  display: 'inline-flex',
  gap: 'var(--space-xs)',
  alignItems: 'center',
  flexShrink: 0,
  padding: 'var(--space-xs) var(--space-s)',
  borderRadius: '100px',
  fontSize: 'var(--font-size-body)',
  fontWeight: 400,
  fontFamily: 'var(--font-body)',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  background: 'var(--color-cta-neutral)',

  variants: {
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
