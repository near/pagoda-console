import { createStitches } from '@stitches/react';

export const { config, createTheme, css, getCssText, globalCss, keyframes, styled, theme } = createStitches({
  theme: {
    colors: {
      border1: '#dedede',
      border2: '#eeeeee',
      brandPrimary: '#2135da',
      surface1: '#ffffff',
      surface2: '#eeeeee',
      surface3: '#dedede',
      text1: '#151515',
      text2: '#323232',
      text3: '#4c4c4c',
    },
    fonts: {
      accent: 'New Spirit, serif',
      body: 'NB International Pro, sans-serif',
    },
    fontSizes: {
      body: '1rem',
      bodySmall: '0.8rem',
      h1: '3rem',
      h2: '2.5rem',
      h3: '2rem',
      h4: '1.5rem',
      h5: '1rem',
      h6: '0.8rem',
    },
    lineHeights: {
      standard: 1.5,
    },
    radii: {
      standard: '3px',
    },
    shadows: {
      soft: '0 2px 10px rgba(0, 0, 0, 0.1)',
      focus: '0 0 0 2px rgba(0, 0, 0, 0.1)',
      focusDark: '0 0 0 2px rgba(0, 0, 0, 0.2)',
    },
    space: {
      xs: '0.25rem',
      s: '0.5rem',
      m: '1rem',
      l: '2rem',
      xl: '4rem',
    },
    sizes: {
      inputSmall: '1.75rem',
      inputStandard: '3rem',
      maxContainerWidth: '75rem',
    },
  },
  media: {
    mobile: '(max-width: 30rem)',
    tablet: '(max-width: 60rem)',
  },
});
