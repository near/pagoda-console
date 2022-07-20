import type { StitchesCSS } from '@/styles/stitches';
import { styled } from '@/styles/stitches';

const hiddenStyles: StitchesCSS = {
  visibility: 'hidden',
  display: 'none',
};

const visibleStyles: StitchesCSS = {
  visibility: 'visible',
  display: 'inline',
};

export const Root = styled('span', {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const Section = styled('span', {
  ...hiddenStyles,

  variants: {
    standard: {
      true: {
        ...visibleStyles,
        '@laptop': hiddenStyles,
      },
    },
    laptop: {
      true: {
        '@laptop': visibleStyles,
        '@tablet': hiddenStyles,
      },
    },
    tablet: {
      true: {
        '@tablet': visibleStyles,
        '@mobile': hiddenStyles,
      },
    },
    mobile: {
      true: {
        '@mobile': visibleStyles,
      },
    },
  },
});
