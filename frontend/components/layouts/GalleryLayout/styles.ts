import { styled } from '@/styles/stitches';

export const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

export const Main = styled('main', {});

export const Header = styled('header', {
  flexShrink: 0,
  padding: 'var(--space-l)',
  top: 0,
  zIndex: 500,
  position: 'absolute',
});

export const Title = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-l)',

  background: 'yellow',
});

export const Controls = styled('div', {
  display: 'flex',
  gap: 'var(--space-l)',

  background: 'black',
});
