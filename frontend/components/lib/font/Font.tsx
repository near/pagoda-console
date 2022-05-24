import { styled } from '@/styles/stitches';

export const Font = styled('span', {
  variants: {
    color: {
      danger: {
        color: 'var(--color-danger)',
      },
      primary: {
        color: 'var(--color-primary)',
      },
      text1: {
        color: 'var(--color-text-1)',
      },
      text2: {
        color: 'var(--color-text-2)',
      },
      text3: {
        color: 'var(--color-text-3)',
      },
    },

    family: {
      accent: {
        fontWeight: 300,
        fontFamily: 'var(--font-accent)',
      },
      body: {
        fontFamily: 'var(--font-body)',
      },
      code: {
        fontFamily: 'var(--font-code)',
      },
      number: {
        fontFamily: 'var(--font-number)',
      },
    },

    size: {
      h1: {
        fontSize: 'var(--font-size-h1)',
        lineHeight: 'var(--line-height-h1)',
      },
      h2: {
        fontSize: 'var(--font-size-h2)',
        lineHeight: 'var(--line-height-h2)',
      },
      h3: {
        fontSize: 'var(--font-size-h3)',
        lineHeight: 'var(--line-height-h3)',
      },
      h4: {
        fontSize: 'var(--font-size-h4)',
        lineHeight: 'var(--line-height-h4)',
      },
      h5: {
        fontSize: 'var(--font-size-h5)',
        lineHeight: 'var(--line-height-h5)',
      },
      h6: {
        fontSize: 'var(--font-size-h6)',
        lineHeight: 'var(--line-height-h6)',
      },
      body: {
        fontSize: 'var(--font-size-body)',
        lineHeight: 'var(--line-height-body)',
      },
      bodySmall: {
        fontSize: 'var(--font-size-body-small)',
        lineHeight: 'var(--line-height-body-small)',
      },
    },
  },
});
