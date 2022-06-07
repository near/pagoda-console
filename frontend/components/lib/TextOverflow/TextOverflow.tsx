import { styled } from '@/styles/stitches';

export const TextOverflow = styled('span', {
  display: 'block',
  width: '100%',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: 0,
  whiteSpace: 'nowrap',
});
