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
        margin: 'auto',
      },
    },
    size: {
      xs: {
        width: 'var(--size-input-height-xs)',
        height: 'var(--size-input-height-xs)',
        borderWidth: '2px',
      },
      s: {
        width: 'var(--size-input-height-s)',
        height: 'var(--size-input-height-s)',
        borderWidth: '3px',
      },
      m: {
        width: 'var(--size-input-height-m)',
        height: 'var(--size-input-height-m)',
        borderWidth: '4px',
      },
    },
  },

  defaultVariants: {
    size: 'm',
  },
});
