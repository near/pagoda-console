import { keyframes, styled } from '@/styles/stitches';

const spinAnimation = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const Content = styled('span', {
  display: 'flex',
  gap: 'var(--space-s)',
  alignItems: 'center',
  overflow: 'hidden',
});

export const Root = styled('label', {
  border: `dashed 2px var(--color-border-2)`,
  borderRadius: 'var(--border-radius-s)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-m)',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 500,
  fontFamily: 'var(--font-action)',
  fontSize: 'var(--font-size-body)',
  height: 'var(--size-input-height-m)',
  padding: '0 var(--space-m)',
  flexShrink: 0,
  transition: 'var(--transitions)',
  position: 'relative',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  background: 'transparent',
  boxShadow: 'none',
  color: 'var(--color-text-1)',

  '&:hover': {
    background: 'var(--color-surface-1)',
  },

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  variants: {
    dragging: {
      true: {
        background: 'var(--color-surface-1)',
        borderColor: 'var(--color-primary)',
      },
    },

    loading: {
      true: {
        pointerEvents: 'none',

        '&:disabled': {
          opacity: 1,
        },

        [`& ${Content}`]: {
          opacity: 0,
        },

        '&:before': {
          content: '',
          display: 'block',
          width: '1.2em',
          height: '1.2em',
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          margin: '-0.6em auto 0',
          borderRadius: '100%',
          border: '3px solid currentColor',
          borderTopColor: 'transparent',
          animation: `${spinAnimation} 700ms linear infinite`,
        },
      },
    },

    stretch: {
      true: {
        width: '100%',
      },
    },
  },
});
