import { styled } from '@/styles/stitches';

export const Card = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: '21rem',
  height: '21rem',
  borderRadius: 'var(--border-radius-xl)',
  background: 'var(--color-surface-2)',
  padding: 'var(--space-l)',
  transition: 'var(--transitions)',

  '&[role="button"]': {
    cursor: 'pointer',
    '&:focus': {
      outline: 'var(--focus-outline)',
      outlineOffset: 'var(--focus-outline-offset)',
    },
    '&:hover': {
      background: 'var(--color-surface-1)',
    },
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

export const CardTop = styled('div', {});

export const CardBottom = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-m)',
});
