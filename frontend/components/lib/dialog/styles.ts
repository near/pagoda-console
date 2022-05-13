import * as DialogPrimitive from '@radix-ui/react-dialog';
import { keyframes, styled } from '@stitches/react';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.8, 0.8)' },
  '100%': { opacity: 1, transform: 'scale(1, 1)' },
});

export const Overlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  position: 'fixed',
  inset: 0,
  animation: `${overlayShow} 150ms ease`,
});

export const Wrapper = styled('div', {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-l)',
});

export const Content = styled(DialogPrimitive.Content, {
  backgroundColor: 'var(--color-surface-2)',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-soft)',
  width: '100%',
  maxWidth: '450px',
  maxHeight: '100%',
  animation: `${contentShow} 150ms ease`,
  overflow: 'auto',
  scrollBehavior: 'smooth',
});

export const ContentInner = styled('div', {
  padding: 'var(--space-l)',
});

export const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  gap: 'var(--space-m)',
  padding: 'var(--space-m) var(--space-l)',
  background: 'var(--color-surface-2)',
  borderBottom: '1px solid var(--color-surface-1)',
  boxShadow: 'var(--shadow-softer)',
});

export const Title = styled(DialogPrimitive.Title, {
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: 'var(--font-size-h4)',
  lineHeight: 1.3,
});

export const CloseButton = styled(DialogPrimitive.Close, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: '100%',
  cursor: 'pointer',
  color: 'var(--color-text-2)',
  background: 'var(--color-surface-3)',
  transition: 'color var(--transition-speed)',

  '&:hover': {
    color: 'var(--color-text-1)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },
});
