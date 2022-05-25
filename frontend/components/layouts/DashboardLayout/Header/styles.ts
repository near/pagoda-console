import { styled } from '@/styles/stitches';

export const Header = styled('header', {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  height: 'var(--size-header-height)',
  padding: '0 var(--space-m)',
  position: 'sticky',
  top: 0,
  background: 'var(--color-surface-2)',
  zIndex: 500,
});
