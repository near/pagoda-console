import * as DialogPrimitive from '@radix-ui/react-dialog';

import { keyframes, styled } from '@/styles/stitches';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const overlayHide = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

const contentShow = keyframes({
  '0%': { transform: 'scale(0.9, 0.9)' },
  '100%': { transform: 'scale(1, 1)' },
});

const contentHide = keyframes({
  '0%': { transform: 'scale(1, 1)' },
  '100%': { transform: 'scale(0.9, 0.9)' },
});

export const Overlay = styled(DialogPrimitive.Overlay, {
  '--animation-speed': '300ms',
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-l)',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(3px)',

  '&[data-state="open"]': {
    animation: `${overlayShow} var(--animation-speed) ease`,
  },
  '&[data-state="closed"]': {
    animation: `${overlayHide} var(--animation-speed) ease`,
  },

  '@mobile': {
    padding: 'var(--space-s)',
  },
});

export const Content = styled(DialogPrimitive.Content, {
  backgroundColor: 'var(--color-surface-2)',
  borderRadius: 'var(--border-radius-l)',
  boxShadow: 'var(--shadow-soft)',
  width: '100%',
  maxHeight: '100%',
  overflow: 'auto',
  scrollBehavior: 'smooth',

  '&[data-state="open"]': {
    animation: `${contentShow} var(--animation-speed) ease`,
  },
  '&[data-state="closed"]': {
    animation: `${contentHide} var(--animation-speed) ease`,
  },

  variants: {
    size: {
      small: {
        maxWidth: 'var(--size-max-container-width-s)',
      },
      medium: {
        maxWidth: 'var(--size-max-container-width-m)',
      },
      large: {
        maxWidth: 'var(--size-max-container-width-l)',
      },
    },
  },

  defaultVariants: {
    size: 'medium',
  },
});

export const ContentBody = styled('div', {
  padding: 'var(--space-l)',

  '@mobile': {
    padding: 'var(--space-m)',
  },
});

export const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  gap: 'var(--space-m)',
  padding: 'var(--space-m) var(--space-l)',
  background: 'var(--color-surface-3)',
  boxShadow: 'var(--shadow-softer)',
  wordBreak: 'break-word',

  '@mobile': {
    padding: 'var(--space-m)',
  },
});

export const HeaderContent = styled('div', {
  flexGrow: '100',
});

export const Title = styled(DialogPrimitive.Title, {
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: 'var(--font-size-h3)',
  lineHeight: 'var(--line-height-h3)',
});

export const CloseButton = styled(DialogPrimitive.Close, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  flexShrink: '0',
  borderRadius: '100%',
  cursor: 'pointer',
  color: 'var(--color-text-2)',
  background: 'var(--color-surface-1)',
  transition: 'color var(--transition-speed)',

  '&:hover': {
    color: 'var(--color-text-1)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },
});
