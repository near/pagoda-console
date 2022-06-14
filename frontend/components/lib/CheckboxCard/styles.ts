import { styled } from '@/styles/stitches';

export const Label = styled('label', {
  display: 'block',
  width: '10rem',
  height: '10rem',
  userSelect: 'none',

  defaultVariants: {
    justify: 'center',
  },
});

export const Group = styled('div', {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 'var(--space-m)',
});

export const Card = styled('span', {
  display: 'flex',
  position: 'relative',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-xs)',
  padding: 'var(--space-m)',
  width: '100%',
  height: '100%',
  fontFamily: 'var(--font-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'var(--color-text-1)',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-surface-2)',
  borderRadius: 'var(--border-radius-s)',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'var(--transitions)',

  '&:hover': {
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

export const Input = styled('input', {
  opacity: 0,
  position: 'absolute',

  '&:checked +': {
    [`${Card}`]: {
      color: 'var(--color-primary)',
      borderColor: 'var(--color-primary)',
    },
  },

  '&:disabled +': {
    [`${Card}`]: {
      opacity: 0.5,
      pointerEvents: 'none',
      borderColor: 'transparent',
    },
  },

  '&:focus +': {
    [`${Card}`]: {
      boxShadow: 'var(--shadow-softer)',
      outline: 'var(--focus-outline)',
      outlineOffset: 'var(--focus-outline-offset)',
    },
  },
});

export const Title = styled('span', {
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  fontSize: 'var(--font-size-h5)',
  lineHeight: 'var(--line-height-h5)',
});

export const Description = styled('span', {
  color: 'var(--color-text-2)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: 'var(--font-size-body-small)',
  lineHeight: 'var(--line-height-body-small)',
});
