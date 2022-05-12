import { createStitches } from '@stitches/react';

export const { config, createTheme, css, getCssText, globalCss, keyframes, styled, theme } = createStitches({
  theme: {
    colors: {
      gray900: '#FFFFFF',
      gray850: '#F0F2F4',
      gray800: '#D6DAE1',
      gray700: '#BCC3CD',
      gray600: '#A1ABBA',
      gray500: '#8793A6',
      gray400: '#6C7C93',
      gray300: '#576375',
      gray200: '#414A58',
      gray100: '#2B323B',
      gray50: '#1f2429',
      gray25: '#16191D',

      green900: '#EFF6EE',
      green800: '#D3E6D1',
      green700: '#B6D6B3',
      green600: '#9AC695',
      green500: '#7EB677',
      green400: '#61A659',
      green300: '#4E8448',
      green200: '#3A6336',
      green100: '#274224',
      green50: '#132112',

      red900: '#FCE9E9',
      red800: '#F7C0C0',
      red700: '#F19898',
      red600: '#EC6F6F',
      red500: '#E64747',
      red400: '#E11E1E',
      red300: '#B41818',
      red200: '#871212',
      red100: '#5A0C0C',
      red50: '#2D0606',
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
      soft: '0 2px 10px rgba(0, 0, 0, 0.3)',
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

export const darkTheme = createTheme('dark-theme', {});

export const lightTheme = createTheme('light-theme', {
  colors: {
    gray25: '#FFFFFF',
    gray50: '#FFFFFF',
    gray100: '#D6DAE1',
    gray200: '#BCC3CD',
    gray300: '#A1ABBA',
    gray400: '#8793A6',
    gray500: '#6C7C93',
    gray600: '#576375',
    gray700: '#414A58',
    gray800: '#2B323B',
    gray850: '#1f2429',
    gray900: '#16191D',

    green50: '#EFF6EE',
    green100: '#D3E6D1',
    green200: '#B6D6B3',
    green300: '#9AC695',
    green400: '#7EB677',
    green500: '#61A659',
    green600: '#4E8448',
    green700: '#3A6336',
    green800: '#274224',
    green900: '#132112',

    red50: '#FCE9E9',
    red100: '#F7C0C0',
    red200: '#F19898',
    red300: '#EC6F6F',
    red400: '#E64747',
    red500: '#E11E1E',
    red600: '#B41818',
    red700: '#871212',
    red800: '#5A0C0C',
    red900: '#2D0606',
  },

  shadows: {
    soft: '0 2px 10px rgba(0, 0, 0, 0.15)',
  },
});
