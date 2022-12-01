import { styled } from '@/styles/stitches';

export const Header = styled('header', {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  gap: 'var(--space-m)',
  height: 'var(--size-header-height)',
  padding: 'var(--space-s) var(--space-m) var(--space-s) var(--space-l)',
  position: 'fixed',
  top: 0,
  left: 'var(--size-sidebar-width-collapsed)',
  right: 0,
  background: 'var(--color-surface-2)',
  borderBottom: '1px solid var(--color-surface-1)',
  boxShadow: 'var(--shadow-softer)',
  zIndex: 500,
  overflowX: 'clip',
  transition: 'left var(--sidebar-animation-speed) ease',

  '.sidebar-expanded &': {
    left: 'var(--size-sidebar-width-expanded)',
  },

  '@tablet': {
    padding: 'var(--space-s)',
    paddingLeft: 'calc(var(--size-sidebar-width-collapsed) + var(--space-m))',
    left: '0 !important',
  },
});
