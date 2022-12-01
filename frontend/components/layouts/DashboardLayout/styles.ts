import { styled } from '@/styles/stitches';

export const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  width: '100%',
});

export const Main = styled('main', {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 auto',
  paddingTop: 'var(--size-header-height)',
});
