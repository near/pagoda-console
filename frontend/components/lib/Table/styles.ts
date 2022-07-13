import { styled } from '@/styles/stitches';

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
  zIndex: 100,
  position: 'relative',

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
  },
});

export const HeaderCell = styled('th', {
  position: 'relative',
  padding: 'var(--space-s) var(--space-s) calc(var(--space-s) * 2)',
  fontSize: 'var(--font-size-body-small)',
  lineHeight: 'var(--line-height-body-small)',
  color: 'var(--color-text-3)',
  verticalAlign: 'bottom',
  whiteSpace: 'nowrap',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  background: 'linear-gradient(var(--color-surface-2) 85%, transparent)',
  transition: 'var(--transitions)',

  'thead tr:first-child &': {
    paddingTop: 'calc(var(--space-s) * 2)',
  },

  'thead &': {
    '&::after': {
      content: '',
      display: 'block',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 'var(--space-s)',
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
});

export const HeaderCustomCell = styled('th', {
  position: 'relative',
  padding: 'calc(var(--space-s) * 2) var(--space-s)',
  background: 'var(--color-surface-2)',

  'thead &': {
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

        '&:focus': {
          outline: 'var(--focus-outline)',
          outlineOffset: -1,
        },
      },
    },

    wrap: {
      true: {
        whiteSpace: 'normal',
      },
    },
  },
});