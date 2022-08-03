import { keyframes, styled } from '@/styles/stitches';

const flashRowAnimation = keyframes({
  '0%': {
    background: 'var(--color-surface-5)',
  },
  '50%': {
    background: 'var(--color-surface-5)',
  },
  '100%': {
    background: 'transparent',
  },
});

export const Root = styled('div', {
  minWidth: '100%',
  padding: '0 var(--space-s) var(--space-s)',
  borderRadius: 'var(--border-radius-m)',
  background: 'var(--color-surface-2)',
});

export const Table = styled('table', {
  borderCollapse: 'collapse',
  width: '100%',
});

export const Head = styled('thead', {
  width: '100%',
  zIndex: 105,
  position: 'relative',

  'td, th': {
    '&::after': {
      content: '',
      display: 'block',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '1px',
      background: 'var(--color-border-2)',
    },

    '&:first-child': {
      '&::after': {
        left: 'var(--space-s)',
      },
    },

    '&:last-child': {
      '&::after': {
        right: 'var(--space-s)',
      },
    },
  },

  'tr:first-child td, tr:first-child th': {
    paddingTop: 'calc(var(--space-s) * 2)',
  },

  'tr:last-child td, tr:last-child th': {
    paddingBottom: 'calc(var(--space-s) * 2)',

    '&::after': {
      bottom: 'var(--space-s)',
    },
  },

  variants: {
    sticky: {
      true: {
        position: 'sticky',
        top: 'var(--size-header-height)',
      },
    },
  },

  defaultVariants: {
    sticky: true,
  },
});

export const Foot = styled('tfoot', {
  width: '100%',
  zIndex: 100,
  position: 'relative',

  'td, th': {
    background: 'var(--color-surface-2) !important',
  },

  'tr:first-child td, tr:first-child th': {
    paddingTop: 'calc(var(--space-s) * 2)',
  },

  variants: {
    sticky: {
      true: {
        position: 'sticky',
        bottom: 0,

        'td, th': {
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          background: 'linear-gradient(to top, var(--color-surface-2) 40%, transparent) !important',

          '&:empty': {
            display: 'none',
          },
        },
      },
    },
  },

  defaultVariants: {
    sticky: true,
  },
});

export const Body = styled('tbody', {
  width: '100%',
});

export const Row = styled('tr', {
  width: '100%',

  '&:hover': {
    td: {
      background: 'var(--color-surface-3)',
    },
  },

  variants: {
    clickable: {
      true: {
        cursor: 'pointer',

        '&:focus': {
          outline: 'var(--focus-outline)',
          outlineOffset: -1,
        },
      },
    },

    flash: {
      true: {
        td: {
          animation: `${flashRowAnimation} 2000ms`,
        },
      },
    },
  },
});

export const HeaderCell = styled('th', {
  position: 'relative',
  padding: 'var(--space-s)',
  fontSize: 'var(--font-size-body-small)',
  lineHeight: 'var(--line-height-body-small)',
  color: 'var(--color-text-3)',
  verticalAlign: 'bottom',
  whiteSpace: 'nowrap',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  background: 'linear-gradient(var(--color-surface-2) 85%, transparent)',
  transition: 'var(--transitions)',
});

export const HeaderCustomCell = styled('th', {
  position: 'relative',
  padding: 'var(--space-s)',
  paddingBottom: 'calc(var(--space-s) * 2) !important',
  background: 'var(--color-surface-2)',
});

export const Cell = styled('td', {
  padding: 'var(--space-s)',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  transition: 'var(--transitions)',
  fontSize: 'var(--font-size-body-small)',
  lineHeight: 'var(--line-height-body-small)',

  '&:first-child': {
    borderTopLeftRadius: 'var(--border-radius-s)',
    borderBottomLeftRadius: 'var(--border-radius-s)',
  },

  '&:last-child': {
    borderTopRightRadius: 'var(--border-radius-s)',
    borderBottomRightRadius: 'var(--border-radius-s)',
  },

  variants: {
    clickable: {
      true: {
        cursor: 'pointer',

        '&:hover': {
          background: 'var(--color-surface-4) !important',
        },

        '&:focus, &:focus-within': {
          outline: 'var(--focus-outline)',
          outlineOffset: -1,
        },
      },
    },

    link: {
      true: {
        padding: 0,
      },
    },

    wrap: {
      true: {
        whiteSpace: 'normal',
      },
    },
  },
});

export const CellAnchor = styled('a', {
  display: 'block',
  padding: 'var(--space-s)',
});
