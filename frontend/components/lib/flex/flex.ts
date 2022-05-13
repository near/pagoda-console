import { styled } from '@/styles/stitches';

export const Flex = styled('div', {
  display: 'flex',
  flexDirection: 'row',

  variants: {
    align: {
      center: {
        alignItems: 'center',
      },
      end: {
        alignItems: 'flex-end',
      },
      start: {
        alignItems: 'flex-start',
      },
      stretch: {
        alignItems: 'stretch',
      },
    },

    gap: {
      xs: {
        gap: 'var(--space-xs)',
      },
      s: {
        gap: 'var(--space-s)',
      },
      m: {
        gap: 'var(--space-m)',
      },
      l: {
        gap: 'var(--space-l)',
      },
      xl: {
        gap: 'var(--space-xl)',
      },
    },

    justify: {
      center: {
        justifyContent: 'center',
      },
      end: {
        justifyContent: 'flex-end',
      },
      spaceAround: {
        justifyContent: 'space-around',
      },
      spaceBetween: {
        justifyContent: 'space-between',
      },
      spaceEvenly: {
        justifyContent: 'space-evenly',
      },
      start: {
        justifyContent: 'flex-start',
      },
      stretch: {
        justifyContent: 'stretch',
      },
    },

    stack: {
      mobile: {
        '@mobile': {
          flexDirection: 'column',
        },
      },
      tablet: {
        '@tablet': {
          flexDirection: 'column',
        },
      },
    },

    wrap: {
      true: {
        flexWrap: 'wrap',
      },
    },
  },

  defaultVariants: {
    gap: 'm',
    justify: 'start',
  },
});
