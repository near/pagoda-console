import { styled } from '@/styles/stitches';

export const Card = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'end',
  width: '100%',
  maxWidth: '18rem',
  height: '18rem',
  borderRadius: 'var(--border-radius-xl)',
  background: 'var(--color-surface-3)',
  padding: 'var(--space-l)',
  transition: 'var(--transitions)',

  '&[role="button"]': {
    cursor: 'pointer',
    '&:focus': {
      outline: 'var(--focus-outline)',
      outlineOffset: 'var(--focus-outline-offset)',
    },
    '&:hover': {
      background: 'var(--color-surface-2)',
    },
  },

  '@tablet': {
    height: 'auto',
    maxWidth: '100%',
    borderRadius: 'var(--border-radius-l)',
  },

  variants: {
    disabled: {
      true: {
        background: 'none',
        border: '1px solid var(--color-surface-5)',
        pointerEvents: 'none',
      },
    },
  },
});

export const Content = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-m)',
});
