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
  width: '2rem',
  height: '2rem',
  borderRadius: '100%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  color: 'var(--color-text-2)',
  transition: 'color var(--transition-speed)',

  '&:hover': {
    color: 'var(--color-text-1)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  '&[data-theme="dark"]': {
    animation: `${darkThemeAnimation} var(--animation-speed) ease forwards`,
  },

  '&[data-theme="light"]': {
    animation: `${lightThemeAnimation} var(--animation-speed) ease forwards`,
  },
});
