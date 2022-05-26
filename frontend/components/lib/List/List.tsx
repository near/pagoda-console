import { styled } from '@/styles/stitches';

export const List = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 'var(--space-m)',

  'ul&': {
    listStyle: 'outside disc',
  },

  'ol&': {
    listStyle: 'outside number',
  },

  variants: {
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
  },

  defaultVariants: {
    gap: 's',
  },
});

export const ListItem = styled('li', {
  width: '100%',
  color: 'var(--color-text-2)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  lineHeight: 'var(--line-height-body)',

  '&::marker': {
    color: 'var(--color-text-3)',
  },
});
