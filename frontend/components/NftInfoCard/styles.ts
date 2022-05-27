import { styled } from '@/styles/stitches';

export const Root = styled('div', {
  '--animation-speed': '300ms',
  position: 'fixed',
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-m)',
  width: '30rem',
  bottom: 'var(--space-m)',
  right: 'var(--space-m)',
  borderRadius: 'var(--border-radius-m)',
  boxShadow: 'var(--shadow-soft)',
  padding: 'var(--space-m)',
  background: 'var(--color-surface-overlay)',
  maxHeight: '4.5rem',
  overflow: 'hidden',
  transition: 'max-height 300ms ease',

  variants: {
    open: {
      true: {
        overflow: 'auto',
        scrollBehavior: 'smooth',
        maxHeight: '40rem',

        '[data-arrow-icon]': {
          transform: 'rotate(-180deg)',
        },
      },
    },
  },
});

export const Header = styled('button', {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'var(--transitions)',
  gap: 'var(--space-m)',

  '&:focus': {
    '[data-arrow-icon]': {
      outline: 'var(--focus-outline)',
      outlineOffset: 'var(--focus-outline-offset)',
    },
  },

  '&:hover': {
    color: 'var(--color-primary)',
  },

  svg: {
    transition: 'transform var(--animation-speed)',
  },
});

export const Body = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-m)',
});

export const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  columnGap: 'var(--space-m)',
});

export const GridKey = styled('span', {
  fontWeight: 700,
});

export const GridValue = styled('span', {
  fontWeight: 400,
});
