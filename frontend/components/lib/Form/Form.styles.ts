import { styled } from '@/styles/stitches';

export const Form = styled('form', {
  display: 'block',
  width: '100%',
});

export const Fieldset = styled('fieldset', {
  display: 'block',
  width: '100%',
});

export const Group = styled('div', {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',

  variants: {
    horizontal: {
      true: {
        flexDirection: 'row',
        gap: 'var(--space-m)',
        minHeight: 'var(--size-input-m)',
        alignItems: 'center',

        '& > :first-child': {
          flexShrink: 0,
          flexGrow: 0,
          width: '12rem',
        },
      },
    },

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

    maxWidth: {
      xs: {
        maxWidth: 'var(--size-max-input-width-xs)',
      },
      s: {
        maxWidth: 'var(--size-max-input-width-s)',
      },
      m: {
        maxWidth: 'var(--size-max-input-width-m)',
      },
      l: {
        maxWidth: 'var(--size-max-input-width-l)',
      },
      xl: {
        maxWidth: 'var(--size-max-input-width-xl)',
      },
    },
  },

  defaultVariants: {
    gap: 'xs',
  },
});

export const Legend = styled('legend', {
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  lineHeight: 'var(--line-height-body)',
});

export const Label = styled('label', {
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  lineHeight: 'var(--line-height-body)',
});

export const LabelDescription = styled('p', {
  color: 'var(--color-text-2)',
  fontFamily: 'var(--font-body)',
  lineHeight: 'var(--line-height-body)',
});

export const Input = styled('input', {
  flexGrow: 1,
  color: 'var(--color-text-1)',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-surface-1)',
  fontSize: 'var(--font-size-body)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  height: 'var(--size-input-m)',
  padding: '0 var(--space-m)',
  borderRadius: 'var(--border-radius-s)',
  transition: 'background var(--transition-speed), border var(--transition-speed), opacity var(--transition-speed)',

  '&::placeholder': {
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-3)',
  },

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },

  '&:focus': {
    background: 'var(--color-surface-1)',
    borderColor: 'var(--focus-outline-color)',
  },

  variants: {
    invalid: {
      true: {
        borderColor: 'var(--color-danger) !important',
      },
    },
  },
});

export const Feedback = styled('p', {
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,

  variants: {
    type: {
      invalid: {
        color: 'var(--color-danger)',
      },
      success: {
        color: 'var(--color-success)',
      },
      neutral: {
        color: 'var(--color-text-2)',
      },
    },
  },

  defaultVariants: {
    type: 'invalid',
  },
});
