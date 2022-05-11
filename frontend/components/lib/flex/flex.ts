import { styled } from '@/styles/theme';

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
        gap: '$xs',
      },
      s: {
        gap: '$s',
      },
      m: {
        gap: '$m',
      },
      l: {
        gap: '$l',
      },
      xl: {
        gap: '$xl',
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
