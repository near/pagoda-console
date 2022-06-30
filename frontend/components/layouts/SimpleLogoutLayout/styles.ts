import { styled } from '@/styles/stitches';

export const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

export const Main = styled('main', {
  display: 'flex',
  flex: '1 0 auto',
  flexDirection: 'column',
  gap: 'var(--space-l)',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-l) var(--space-m)',
});

export const Header = styled('header', {
  flexShrink: 0,
  padding: 'var(--space-m)',
  position: 'sticky',
  top: 0,
  background: 'var(--color-surface-2)',
  borderBottom: '1px solid var(--color-surface-1)',
  boxShadow: 'var(--shadow-softer)',
  zIndex: 500,
});
