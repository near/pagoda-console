import { keyframes, styled } from '@/styles/stitches';

const glowingAnimation = keyframes({
  '0%': {
    opacity: 1,
  },
  '50%': {
    opacity: 0.25,
  },
  '100%': {
    opacity: 1,
  },
});

export const Placeholder = styled('div', {
  borderRadius: 'var(--border-radius-s)',
  height: '1rem',
  width: '10rem',
  background: 'var(--color-surface-5)',
  animation: `${glowingAnimation} 1s infinite ease`,
});
