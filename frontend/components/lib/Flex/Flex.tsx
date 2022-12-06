import { styled } from '@/styles/stitches';

export const Flex = styled('div', {
  display: 'flex',
  width: '100%',

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

    autoWidth: {
      true: {
        width: 'auto',
      },
    },

    gap: {
      none: {
        gap: '0',
      },
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
      xxl: {
        gap: 'var(--space-xxl)',
      },
    },

    inline: {
      true: {
        display: 'inline-flex',
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
      true: {
        flexDirection: 'column',
      },
    },

    wrap: {
      true: {
        flexWrap: 'wrap',
      },
    },
  },

  defaultVariants: {
    align: 'start',
    gap: 'm',
    justify: 'start',
  },
});
