import type { CSS, VariantProps } from '@stitches/react';
import { createStitches } from '@stitches/react';
import type { JSXElementConstructor } from 'react';

export const { config, css, getCssText, globalCss, keyframes, styled, theme } = createStitches({
  media: {
    mobile: '(max-width: 30rem)',
    tablet: '(max-width: 60rem)',
  },
});

export type StitchesCSS = CSS<typeof config>;

export type StitchesProps<T extends JSXElementConstructor<any>> = VariantProps<T> & {
  css?: CSS;
};