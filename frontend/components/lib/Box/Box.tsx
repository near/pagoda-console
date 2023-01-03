import { styled } from '@/styles/stitches';
import { background, padding } from '@/styles/variants';

export const Box = styled('div', {
  variants: {
    padding,
    background,
  },

  defaultVariants: {
    padding: 'none',
    background: 'none',
  },
});
