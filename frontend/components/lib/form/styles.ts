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
  gap: 'var(--space-s)',
});

export const Label = styled('label', {
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  lineHeight: 1.2,
});

export const LabelDescription = styled('p', {
  color: 'var(--color-text-2)',
  fontFamily: 'var(--font-body)',
  lineHeight: 1.2,
});

export const Input = styled('input', {
  color: 'var(--color-text-1)',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-surface-4)',
  fontSize: 'var(--font-size-body)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  height: 'var(--size-input-standard)',
  padding: '0 var(--space-m)',
  borderRadius: 'var(--border-radius-s)',
  transition: 'background var(--transition-speed), border var(--transition-speed), box-shadow var(--transition-speed)',

  '&::placeholder': {
    fontSize: 'var(--font-size-body-small)',
    color: 'var(--color-text-3)',
  },

  '&:disabled': {
    opacity: 0.25,
    pointerEvents: 'none',
  },

  '&:focus': {
    boxShadow: 'var(--shadow-soft)',
    background: 'var(--color-surface-1)',
  },

  variants: {
    invalid: {
      true: {
        borderColor: 'var(--color-danger)',
      },
    },
  },
});

export const Feedback = styled('p', {
  fontSize: 'var(--font-size-body)',
  lineHeight: 1.2,
  fontFamily: 'var(--font-body)',
  fontWeight: 400,

  variants: {
    type: {
      invalid: {
        color: 'var(--color-danger)',
      },
      success: {
        color: 'var(--color-primary)',
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
