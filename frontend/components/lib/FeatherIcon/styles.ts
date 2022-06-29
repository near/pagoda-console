import { styled } from '@/styles/stitches';

export const Svg = styled('svg', {
  flexShrink: 0,

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
      success: {
        color: 'var(--color-success)',
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

    size: {
      xs: {
        width: 'var(--size-icon-xs)',
        height: 'var(--size-icon-xs)',
      },
      s: {
        width: 'var(--size-icon-s)',
        height: 'var(--size-icon-s)',
      },
      m: {
        width: 'var(--size-icon-m)',
        height: 'var(--size-icon-m)',
      },
      l: {
        width: 'var(--size-icon-l)',
        height: 'var(--size-icon-l)',
      },
      xl: {
        width: 'var(--size-icon-xl)',
        height: 'var(--size-icon-xl)',
      },
    },
  },

  defaultVariants: {
    color: 'current',
    size: 's',
  },
});
