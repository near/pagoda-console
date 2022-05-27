import { styled } from '@/styles/stitches';

export const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  width: '100%',
});

export const Main = styled('main', {
  flex: '1 0 auto',
});

export const Header = styled('header', {
  flexShrink: 0,
  padding: 'var(--space-m)',
  position: 'sticky',
  top: 0,
  background: 'var(--color-surface-2)',
  zIndex: 500,
});
