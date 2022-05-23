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
  '--background-color': 'var(--color-surface-3)',
  borderRadius: 'var(--border-radius-s)',
  padding: 'var(--space-m)',
  minWidth: 'var(--size-max-container-width-xxs)',
  maxWidth: 'var(--size-max-container-width-xs)',
  background: 'var(--background-color)',
  boxShadow: 'var(--shadow-soft)',
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
  color: 'var(--color-text-2)',
  background: 'var(--color-surface-4)',
  transition: 'color var(--transition-speed)',

  '&:hover': {
    color: 'var(--color-text-1)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  svg: {
    width: '0.7rem',
    height: '0.7rem',
  },
});
