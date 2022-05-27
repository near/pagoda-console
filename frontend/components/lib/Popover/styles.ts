import * as PopoverPrimitive from '@radix-ui/react-popover';

import { keyframes, styled } from '@/styles/stitches';

const openAnimation = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.9, 0.9)' },
  '100%': { opacity: 1, transform: 'scale(1, 1)' },
});

const closeAnimation = keyframes({
  '0%': { opacity: 1, transform: 'scale(1, 1)' },
  '100%': { opacity: 0, transform: 'scale(0.9, 0.9)' },
});

export const Content = styled(PopoverPrimitive.Content, {
  '--animation-speed': '200ms',
  '--background-color': 'var(--color-surface-overlay)',
  borderRadius: 'var(--border-radius-s)',
  padding: 'var(--space-m)',
  maxWidth: 'var(--size-max-container-width-xs)',
  background: 'var(--background-color)',
  boxShadow: 'var(--shadow-softer)',
  transformOrigin: 'var(--radix-popover-content-transform-origin)',

  '&[data-state="open"]': {
    animation: `${openAnimation} var(--animation-speed)`,
  },
  '&[data-state="closed"]': {
    animation: `${closeAnimation} var(--animation-speed)`,
  },
});

export const Arrow = styled(PopoverPrimitive.Arrow, {
  fill: 'var(--background-color)',
});

export const CloseButton = styled(PopoverPrimitive.Close, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  flexShrink: '0',
  borderRadius: '100%',
  cursor: 'pointer',
  color: 'var(--color-cta-neutral-text)',
  background: 'var(--color-cta-neutral)',
  transition: 'var(--transitions)',

  '&:hover': {
    background: 'var(--color-cta-neutral-highlight)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  svg: {
    width: '0.8rem',
    height: '0.8rem',
  },
});
