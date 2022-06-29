import { styled } from '@/styles/stitches';

export const Text = styled('p', {
  variants: {
    color: {
      current: {
        color: 'CurrentColor',
      },
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
      warning: {
        color: 'var(--color-warning)',
      },
    },

    family: {
      action: {
        fontWeight: 500,
        fontFamily: 'var(--font-action)',
      },
      body: {
        fontWeight: 400,
        fontFamily: 'var(--font-body)',
      },
      code: {
        fontWeight: 400,
        fontFamily: 'var(--font-code)',
      },
      heading: {
        fontWeight: 600,
        fontFamily: 'var(--font-heading)',
      },
      number: {
        fontWeight: 400,
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

    weight: {
      regular: {
        fontWeight: 400,
      },
      semibold: {
        fontWeight: 600,
      },
    },
  },

  compoundVariants: [
    {
      family: 'action',
      weight: 'semibold',
      css: {
        fontWeight: 500,
      },
    },
    {
      family: 'code',
      weight: 'semibold',
      css: {
        fontWeight: 500,
      },
    },
    {
      family: 'number',
      weight: 'semibold',
      css: {
        fontWeight: 500,
      },
    },
  ],

  defaultVariants: {
    color: 'text2',
    family: 'body',
    size: 'body',
  },
});
