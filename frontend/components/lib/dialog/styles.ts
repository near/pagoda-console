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
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  position: 'fixed',
  inset: 0,
  animation: `${overlayShow} 150ms ease`,
});

export const ContentWrapper = styled('div', {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-m)',
});

export const Content = styled(DialogPrimitive.Content, {
  backgroundColor: 'var(--color-surface-2)',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-soft)',
  width: '100%',
  maxWidth: '450px',
  maxHeight: '100%',
  padding: 'var(--space-l)',
  animation: `${contentShow} 150ms ease`,
  overflow: 'auto',
  scrollBehavior: 'smooth',
});

export const CloseButton = styled(DialogPrimitive.Close, {
  display: 'inline-block',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '100%',
});
