import { styled } from '@/styles/stitches';

export const Header = styled('header', {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  gap: 'var(--space-m)',
  height: 'var(--size-header-height)',
  padding: 'var(--space-s) var(--space-m) var(--space-s) var(--space-l)',
  position: 'sticky',
  top: 0,
  left: 0,
  right: 0,
  background: 'var(--color-surface-3)',
  boxShadow: 'var(--shadow-softer)',
  zIndex: 500,
  overflowX: 'clip',

  '@tablet': {
    padding: 'var(--space-s)',
    paddingLeft: 'calc(var(--size-sidebar-width-collapsed) + var(--space-m))',
  },
});
