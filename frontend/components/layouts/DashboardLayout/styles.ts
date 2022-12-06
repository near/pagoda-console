import { styled } from '@/styles/stitches';

export const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  width: '100%',
  background: 'var(--color-surface-3)',
});

export const Main = styled('main', {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 auto',
});
