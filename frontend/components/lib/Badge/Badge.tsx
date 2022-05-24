import { styled } from '@/styles/stitches';

export const Badge = styled('span', {
  display: 'inline-flex',
  flexShrink: 0,
  padding: 'var(--space-xs) var(--space-s)',
  borderRadius: '100px',
  fontSize: 'var(--font-size-body)',
  fontWeight: 400,
  fontFamily: 'var(--font-code)',
  lineHeight: 1,
  whiteSpace: 'nowrap',

  variants: {
    color: {
      neutral: {
        color: 'var(--color-cta-neutral-text)',
        background: 'var(--color-cta-neutral)',
      },

      primary: {
        color: 'var(--color-cta-primary-text)',
        background: 'var(--color-cta-primary)',
      },

      danger: {
        color: 'var(--color-cta-danger-text)',
        background: 'var(--color-cta-danger)',
      },
    },

    size: {
      standard: {
        fontSize: 'var(--font-size-body)',
      },
      small: {
        fontSize: 'var(--font-size-body-small)',
      },
    },
  },

  defaultVariants: {
    color: 'neutral',
    size: 'standard',
  },
});
