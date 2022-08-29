import { keyframes, styled } from '@/styles/stitches';

const darkThemeAnimation = keyframes({
  from: { transform: 'scale(0.5, 0.5) rotate(0deg)' },
  to: { transform: 'scale(1, 1) rotate(360deg)' },
});

const lightThemeAnimation = keyframes({
  from: { transform: 'scale(0.5, 0.5) rotate(0deg)' },
  to: { transform: 'scale(1, 1) rotate(-360deg)' },
});

export const Button = styled('button', {
  '--animation-speed': '500ms',
  display: 'flex',
  height: '2.5rem',
  width: '100%',
  alignItems: 'center',
  gap: 'var(--space-s)',
  fontFamily: 'var(--font-action)',
  fontSize: 'var(--font-size-body-small)',
  lineHeight: 'var(--line-height-body-small)',
  fontWeight: 500,
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  padding: 'var(--space-s)',
  borderRadius: 'var(--border-radius-s)',
  transition: 'var(--transitions)',
  whiteSpace: 'nowrap',

  '&:hover': {
    color: 'var(--color-cta-primary)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  '&[data-theme="dark"]': {
    svg: { animation: `${darkThemeAnimation} var(--animation-speed) ease forwards` },
  },

  '&[data-theme="light"]': {
    svg: { animation: `${lightThemeAnimation} var(--animation-speed) ease forwards` },
  },

  variants: {
    collapsed: {
      true: {
        justifyContent: 'center',
      },
    },
  },
});
