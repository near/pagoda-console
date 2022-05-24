import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { keyframes, styled } from '@/styles/stitches';

const openAnimation = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const closeAnimation = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

export const Content = styled(TooltipPrimitive.Content, {
  borderRadius: 'var(--border-radius-s)',
  padding: 'var(--space-s) var(--space-m)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  backgroundColor: 'var(--background-color)',
  boxShadow: 'var(--shadow-softer)',

  '&[data-state="delayed-open"]': {
    animation: `${openAnimation} 200ms`,
  },
  '&[data-state="closed"]': {
    animation: `${closeAnimation} 100ms`,
  },

  variants: {
    color: {
      danger: {
        '--background-color': 'var(--color-cta-danger)',
        color: 'var(--color-cta-danger-text)',
      },
      neutral: {
        '--background-color': 'var(--color-surface-1)',
        color: 'var(--color-text-1)',
      },
      primary: {
        '--background-color': 'var(--color-cta-primary)',
        color: 'var(--color-cta-primary-text)',
      },
      reverse: {
        '--background-color': 'var(--color-text-1)',
        color: 'var(--color-surface-1)',
      },
    },
  },

  defaultVariants: {
    color: 'neutral',
  },
});

export const Arrow = styled(TooltipPrimitive.Arrow, {
  fill: 'var(--background-color)',
});
