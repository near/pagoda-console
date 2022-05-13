import { createStitches } from '@stitches/react';

export const { config, css, getCssText, globalCss, keyframes, styled, theme } = createStitches({
  media: {
    mobile: '(max-width: 30rem)',
    tablet: '(max-width: 60rem)',
  },
});
