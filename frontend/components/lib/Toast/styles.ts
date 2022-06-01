import * as ToastPrimitive from '@radix-ui/react-toast';
import { keyframes, styled } from '@stitches/react';

const hideAnimation = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

const slideInAnimation = keyframes({
  from: { transform: `translateX(calc(100% + var(--space-m)))` },
  to: { transform: 'translateX(0)' },
});

const swipeOutAnimation = keyframes({
  from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
  to: { transform: `translateX(calc(100% + var(--space-m)))` },
});

export const Viewport = styled(ToastPrimitive.Viewport, {
  position: 'fixed',
  bottom: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-m)',
  padding: 'var(--space-m)',
  width: '100%',
  maxHeight: '100vh',
  maxWidth: 'var(--size-max-container-width-s)',
  zIndex: 5000,
  overflowY: 'auto',
  scrollBehavior: 'smooth',
});

export const Root = styled(ToastPrimitive.Root, {
  display: 'flex',
  gap: 'var(--space-m)',
  backgroundColor: 'var(--color-surface-overlay)',
  borderRadius: 'var(--border-radius-m)',
  boxShadow: 'var(--shadow-soft)',
  padding: 'var(--space-m)',

  '&[data-state="open"]': {
    animation: `${slideInAnimation} 200ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  '&[data-state="closed"]': {
    animation: `${hideAnimation} 200ms ease-in forwards`,
  },
  '&[data-swipe="move"]': {
    transform: 'translateX(var(--radix-toast-swipe-move-x))',
  },
  '&[data-swipe="cancel"]': {
    transform: 'translateX(0)',
    transition: 'transform 200ms ease-out',
  },
  '&[data-swipe="end"]': {
    animation: `${swipeOutAnimation} 100ms ease-out forwards`,
  },

  variants: {
    type: {
      error: {
        color: 'var(--color-cta-danger-text)',
        background: 'var(--color-cta-danger)',
      },
      info: {
        color: 'var(--color-text-1)',
        background: 'var(--color-surface-overlay)',
      },
      success: {
        color: 'var(--color-cta-success-text)',
        background: 'var(--color-cta-success)',
      },
    },
  },

  defaultVariants: {
    type: 'info',
  },
});

export const Title = styled(ToastPrimitive.Title, {
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  fontWeight: 700,
  color: 'CurrentColor',
});

export const Description = styled(ToastPrimitive.Description, {
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'CurrentColor',
  opacity: 0.7,
});

export const CloseButton = styled(ToastPrimitive.Close, {
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
