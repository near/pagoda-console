import { styled } from '@/styles/stitches';

export const Info = styled('span', {
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: 'var(--size-input-xs)',
  height: 'var(--size-input-xs)',
  borderRadius: '100%',
  background: 'var(--color-surface-3)',
  color: 'var(--color-text-3)',
  transition: 'color var(--transition-speed)',
  cursor: 'pointer',

  '&:focus': {
    color: 'var(--color-text-1)',
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  '&:hover': {
    color: 'var(--color-text-1)',
  },

  svg: {
    width: '0.6rem',
    height: '0.6rem',
  },
});
