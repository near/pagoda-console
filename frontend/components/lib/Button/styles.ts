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

export const Button = styled('button', {
  borderRadius: 'var(--border-radius-s)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-m)',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 500,
  fontFamily: 'var(--font-action)',
  padding: '0 var(--space-m)',
  flexShrink: 0,
  transition: 'var(--transitions)',
  position: 'relative',
  userSelect: 'none',
  whiteSpace: 'nowrap',

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  '& > [data-icon-arrow]': {
    transition: 'transform var(--transition-speed)',
    transform: 'rotate(0deg)',
    color: 'var(--color-text-3)',
  },

  '&[data-state="open"] > [data-icon-arrow]': {
    transform: 'rotate(-180deg)',
  },

  variants: {
    color: {
      danger: {
        background: 'var(--color-cta-danger)',
        color: 'var(--color-cta-danger-text)',
        '&:hover': {
          background: 'var(--color-cta-danger-highlight)',
        },
      },
      dangerBorder: {
        background: 'transparent',
        boxShadow: 'inset 0 0 0 1px currentColor',
        color: 'var(--color-danger)',
        '&:hover': {
          background: 'var(--color-surface-1)',
        },
      },
      input: {
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border-2)',
        color: 'var(--color-text-1)',
        '&:hover': {
          background: 'var(--color-surface-1)',
        },
        '&:focus': {
          outline: 'none',
          borderColor: 'var(--focus-outline-color)',
        },
      },
      primary: {
        background: 'var(--color-cta-primary)',
        color: 'var(--color-cta-primary-text)',
        '&:hover': {
          background: 'var(--color-cta-primary-highlight)',
        },
      },
      primaryBorder: {
        background: 'transparent',
        boxShadow: 'inset 0 0 0 1px currentColor',
        color: 'var(--color-primary)',
        '&:hover': {
          background: 'var(--color-surface-1)',
        },
      },
      primaryDragAndDropBorder: {
        background: 'transparent',
        boxShadow: 'none',
        color: 'var(--color-primary)',
        '&:hover': {
          background: 'var(--color-surface-1)',
        },
      },
      neutral: {
        background: 'transparent',
        boxShadow: 'inset 0 0 0 1px var(--color-surface-5)',
        color: 'var(--color-text-1)',
        '&:hover': {
          background: 'var(--color-surface-1)',
        },
      },
      transparent: {
        background: 'transparent',
        color: 'var(--color-text-1)',
        '&:hover': {
          background: 'var(--color-surface-1)',
        },
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

    size: {
      s: {
        fontSize: 'var(--font-size-body-small)',
        height: 'var(--size-input-height-s)',
        padding: '0 var(--space-s)',
        borderRadius: 'var(--border-radius-xs)',
      },
      m: {
        fontSize: 'var(--font-size-body)',
        height: 'var(--size-input-height-m)',
      },
      l: {
        fontSize: 'var(--font-size-body-small)',
        height: 'calc(2 * var(--size-input-height-s))',
        padding: '0 var(--space-s)',
        borderRadius: 'var(--border-radius-xs)',
      },
    },

    stretch: {
      true: {
        width: '100%',
      },
    },
  },

  defaultVariants: {
    color: 'primary',
    size: 'm',
  },
});

export const DragAndDropButton = styled(Button, {
  display: 'flex',
  alignItems: 'center',
  border: `dashed 2px currentColor`,
});
