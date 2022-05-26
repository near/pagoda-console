import { styled } from '@/styles/stitches';

import { P } from '../Paragraph';

export const Container = styled('div', {
  width: '100%',
  padding: 'var(--space-m)',
  borderRadius: 'var(--border-radius-m)',
  background: 'var(--color-surface-2)',

  variants: {
    type: {
      info: {
        color: 'var(--color-text-1)',
      },
      error: {
        color: 'var(--color-danger)',
      },
      success: {
        color: 'var(--color-success)',
      },
    },
  },
});

export const Text = styled(P, {
  color: 'CurrentColor',
});
