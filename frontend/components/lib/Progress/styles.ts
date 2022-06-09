import * as ProgressPrimitive from '@radix-ui/react-progress';

import { styled } from '@/styles/stitches';

export const Root = styled(ProgressPrimitive.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--color-surface-5)',
  borderRadius: '100px',
  width: '100%',
  height: '0.5rem',
});

export const Indicator = styled(ProgressPrimitive.Indicator, {
  background: 'var(--color-primary)',
  width: '100%',
  height: '100%',
  transition: 'transform var(--transition-speed)',
});
