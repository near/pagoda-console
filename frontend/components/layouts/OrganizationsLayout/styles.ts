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
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  gap: 'var(--space-m)',
  padding: 'var(--space-m)',
  borderBottom: '1px solid var(--color-surface-5)',

  '@tablet': {
    padding: 'var(--space-s)',
  },
});

export const Title = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-m)',
});

export const Controls = styled('div', {
  display: 'flex',
  gap: 'var(--space-m)',
});

export const BackLink = styled('a', {
  display: 'flex',
  align: 'center',
});
