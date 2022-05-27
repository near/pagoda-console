import { styled } from '@/styles/stitches';

export const TextOverflow = styled('div', {
  width: '100%',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: 0,
  whiteSpace: 'nowrap',
});
