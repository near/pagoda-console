import { styled } from '@/styles/stitches';

export const Indicator = styled('span', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 'var(--size-input-height-xs)',
  height: 'var(--size-input-height-xs)',
  borderRadius: 'var(--border-radius-xs)',
  background: 'var(--color-surface-1)',
  border: '1px solid var(--color-surface-5)',
  transition: 'var(--transitions)',

  svg: {
    width: '0.6rem',
    height: '0.6rem',
    color: 'var(--color-primary)',
    transition: 'opacity var(--transition-speed), transform var(--transition-speed)',
    opacity: 0,
    transform: 'scale(0, 0)',
  },

  variants: {
    invalid: {
      true: {
        borderColor: 'var(--color-danger)',
      },
    },

    radio: {
      true: {
        borderRadius: '100%',
      },
    },
  },
});

export const Description = styled('span', {
  display: 'block',
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  lineHeight: 'var(--line-height-body)',
  flexGrow: 1,
});

export const Label = styled('label', {
  display: 'flex',
  gap: 'var(--space-s)',
  alignItems: 'center',
  userSelect: 'none',
  cursor: 'pointer',

  '&:hover': {
    [`${Indicator}`]: {
      background: 'var(--color-surface-3)',
    },
  },

  variants: {
    disabled: {
      true: {
        pointerEvents: 'none',

        [`${Indicator}, ${Description}`]: {
          opacity: 0.5,
        },
      },
    },
  },
});

export const Group = styled('div', {
  borderRadius: 'var(--border-radius-s)',
  background: 'var(--color-surface-2)',

  [`${Label}`]: {
    borderTop: '1px solid var(--color-border-1)',
    padding: 'var(--space-m)',
    gap: 'var(--space-m)',

    '&:first-child': {
      borderTop: 'none',
    },
  },
});

export const Input = styled('input', {
  opacity: 0,
  position: 'absolute',

  '&:checked +': {
    [`${Indicator}`]: {
      svg: {
        opacity: 1,
        transform: 'scale(1, 1)',
      },
    },
  },

  '&:focus +': {
    [`${Indicator}`]: {
      boxShadow: 'var(--shadow-soft)',
      outline: 'var(--focus-outline)',
      outlineOffset: 'var(--focus-outline-offset)',
    },
  },
});
