import { keyframes, styled } from '@/styles/stitches';

const loadingAnimation = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const Content = styled('span', {
  display: 'flex',
  gap: 'var(--space-s)',
  alignItems: 'center',
});

export const Button = styled('button', {
  borderRadius: 'var(--border-radius-s)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-m)',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 500,
  fontFamily: 'var(--font-code)',
  padding: '0 var(--space-m)',
  flexShrink: 0,
  transition: 'background var(--transition-speed), opacity var(--transition-speed)',
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

  '& > [data-icon="arrow-down"]': {
    opacity: 0.5,
    transition: 'transform 200ms',
    transform: 'rotate(0deg)',
  },

  '&[data-state="open"] > [data-icon="arrow-down"]': {
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
      primary: {
        background: 'var(--color-cta-primary)',
        color: 'var(--color-cta-primary-text)',
        '&:hover': {
          background: 'var(--color-cta-primary-highlight)',
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

    expand: {
      true: {
        width: '100%',
      },
    },

    loading: {
      true: {
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
          animation: `${loadingAnimation} 700ms linear infinite`,
        },
      },
    },

    size: {
      small: {
        fontSize: 'var(--font-size-body-small)',
        height: 'var(--size-input-s)',
      },
      standard: {
        fontSize: 'var(--font-size-body)',
        height: 'var(--size-input-m)',
      },
    },
  },

  defaultVariants: {
    color: 'primary',
    size: 'standard',
  },
});
