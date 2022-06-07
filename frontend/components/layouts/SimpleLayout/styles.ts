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
