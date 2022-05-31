import { keyframes, styled } from '@/styles/stitches';

const spinAnimation = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const Spinner = styled('div', {
  borderRadius: '100%',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  animation: `${spinAnimation} 700ms linear infinite`,

  variants: {
    center: {
      true: {
        margin: '0 auto',
      },
    },
    size: {
      xs: {
        width: 'var(--size-input-xs)',
        height: 'var(--size-input-xs)',
        borderWidth: '2px',
      },
      s: {
        width: 'var(--size-input-s)',
        height: 'var(--size-input-s)',
        borderWidth: '3px',
      },
      m: {
        width: 'var(--size-input-m)',
        height: 'var(--size-input-m)',
        borderWidth: '4px',
      },
    },
  },

  defaultVariants: {
    size: 'm',
  },
});
