import { styled } from '@/styles/stitches';

export const Container = styled('div', {
  margin: '0 auto',
  width: '100%',

  variants: {
    size: {
      xxs: {
        maxWidth: 'var(--size-max-container-width-xxs)',
      },
      xs: {
        maxWidth: 'var(--size-max-container-width-xs)',
      },
      s: {
        maxWidth: 'var(--size-max-container-width-s)',
      },
      m: {
        maxWidth: 'var(--size-max-container-width-m)',
      },
      l: {
        maxWidth: 'var(--size-max-container-width-l)',
      },
    },
  },

  defaultVariants: {
    size: 'l',
  },
});
