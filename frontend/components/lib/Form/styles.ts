import type { StitchesCSS } from '@/styles/stitches';
import { styled } from '@/styles/stitches';

export const Form = styled('form', {
  display: 'block',
  width: '100%',

  variants: {
    disabled: {
      true: {
        pointerEvents: 'none',
      },
    },
  },
});

export const Fieldset = styled('fieldset', {
  display: 'block',
  width: '100%',
});

export const Group = styled('div', {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',

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

    maxWidth: {
      xxs: {
        maxWidth: 'var(--size-max-input-width-xxs)',
      },
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
    },
  },

  defaultVariants: {
    gap: 'xs',
  },
});

export const HorizontalGroup = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'fit-content(15rem) 1fr',
  alignItems: 'center',
  columnGap: 'var(--space-l)',
  rowGap: 'var(--space-m)',
  width: '100%',

  [`${Group}`]: {
    minHeight: 'var(--size-input-height-m)',
  },
});

export const Label = styled('label', {
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  lineHeight: 'var(--line-height-body)',
});

export const LabelDescription = styled('p', {
  color: 'var(--color-text-2)',
  fontFamily: 'var(--font-body)',
  lineHeight: 'var(--line-height-body)',
});

const inputStyles: StitchesCSS = {
  flexGrow: 1,
  color: 'var(--color-text-1)',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border-2)',
  fontSize: 'var(--font-size-body)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  height: 'var(--size-input-height-m)',
  padding: '0 var(--space-m)',
  borderRadius: 'var(--border-radius-s)',
  transition: 'var(--transitions), border-radius var(--transition-speed)',

  '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },

  '&[list]::-webkit-calendar-picker-indicator': {
    display: 'none !important',
  },

  '&::placeholder': {
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-3)',
  },

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
    borderColor: 'var(--color-surface-2)',
  },

  '&:focus': {
    background: 'var(--color-surface-1)',
    borderColor: 'var(--focus-outline-color)',
  },
};

const inputInvalidStyles = {
  borderColor: 'var(--color-danger) !important',
};

export const Input = styled('input', {
  ...inputStyles,

  variants: {
    number: {
      true: {
        fontFamily: 'var(--font-number)',
      },
    },
    invalid: {
      true: {
        ...inputInvalidStyles,
      },
    },
  },
});

export const InputButtonValue = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  flexGrow: 1,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
});

export const InputButton = styled('button', {
  ...inputStyles,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-m)',
  lineHeight: 1.4,
  cursor: 'pointer',
  padding: '0.25rem var(--space-m)',

  '&:hover': {
    background: 'var(--color-surface-1)',
  },

  '& > [data-icon-arrow]': {
    color: 'var(--color-text-3)',
    transition: 'transform var(--transition-speed)',
    transform: 'rotate(0deg)',
  },

  '&[data-state="open"] > [data-icon-arrow]': {
    transform: 'rotate(-180deg)',
  },

  variants: {
    invalid: {
      true: {
        ...inputInvalidStyles,
      },
    },

    floating: {
      true: {
        [`${InputButtonValue}`]: {
          width: '100%',
          paddingTop: '1.05rem',
        },
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

export const FloatingLabel = styled('span', {
  display: 'block',
  position: 'absolute',
  top: '1.05rem',
  left: 'var(--space-m)',
  right: 'var(--space-m)',
  color: 'var(--color-text-3)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: 'var(--font-size-body)',
  lineHeight: 1,
  transition: 'top var(--transition-speed), font-size var(--transition-speed)',
  pointerEvents: 'none',

  variants: {
    shrink: {
      true: {
        top: '0.5rem',
        fontSize: '0.625rem',
      },
    },
  },
});

export const FloatingWrapper = styled('label', {
  display: 'block',
  position: 'relative',
  flexGrow: 1,

  input: {
    width: '100%',
    paddingTop: '1.05rem',

    '&::placeholder': {
      opacity: 0,
      transition: 'opacity var(--transition-speed)',
    },

    '&:focus': {
      '&::placeholder': {
        opacity: 1,
      },
    },
  },

  [`input:not(:placeholder-shown) + ${FloatingLabel}, input:focus + ${FloatingLabel}`]: {
    top: '0.5rem',
    fontSize: '0.625rem',
  },
});
