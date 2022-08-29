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
  background: 'var(--color-surface-2)',
  borderBottom: '1px solid var(--color-surface-1)',
  boxShadow: 'var(--shadow-softer)',
});
