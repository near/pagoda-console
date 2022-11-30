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
      ml: {
        maxWidth: 'var(--size-max-container-width-ml)',
      },
      l: {
        maxWidth: 'var(--size-max-container-width-l)',
      },
      xl: {
        maxWidth: 'var(--size-max-container-width-xl)',
      },
    },
  },

  defaultVariants: {
    size: 'l',
  },
});
