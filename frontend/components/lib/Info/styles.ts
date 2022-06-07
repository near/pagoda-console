import { styled } from '@/styles/stitches';

export const Info = styled('span', {
  display: 'inline-flex',
  color: 'var(--color-text-3)',
  alignItems: 'center',
  justifyContent: 'center',

  '&:hover': {
    color: 'var(--color-text-1)',
  },
});
