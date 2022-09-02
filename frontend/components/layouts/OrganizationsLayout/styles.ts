import { styled } from '@/styles/stitches';

export const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

export const Main = styled('main', {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});

export const Header = styled('header', {
  flexShrink: 0,
  padding: 'var(--space-m)',
  position: 'sticky',
  top: 0,
  borderBottom: '1px solid var(--color-surface-5)',
  zIndex: 500,
});

export const Title = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-l)',
});

export const Controls = styled('div', {
  display: 'flex',
  gap: 'var(--space-l)',
});
