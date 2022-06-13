import * as SliderPrimitive from '@radix-ui/react-slider';

import { styled } from '@/styles/stitches';

export const Root = styled(SliderPrimitive.Root, {
  '--thumb-size': 'var(--size-input-height-s)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  height: 'var(--thumb-size)',

  '&[data-orientation="vertical"]': {
    flexDirection: 'column',
    width: 'var(--thumb-size)',
    height: '100%',
  },
});

export const Track = styled(SliderPrimitive.Track, {
  background: 'var(--color-surface-5)',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',

  '&[data-orientation="horizontal"]': { height: 3 },
  '&[data-orientation="vertical"]': { width: 3 },
});

export const Range = styled(SliderPrimitive.Range, {
  position: 'absolute',
  background: 'var(--color-primary)',
  borderRadius: '9999px',

  '[data-orientation="horizontal"] &': {
    height: '100%',
  },

  '[data-orientation="vertical"] &': {
    width: '100%',
  },
});

export const Thumb = styled(SliderPrimitive.Thumb, {
  display: 'block',
  width: 'var(--thumb-size)',
  height: 'var(--thumb-size)',
  background: 'var(--color-cta-primary)',
  boxShadow: 'var(--shadow-soft)',
  borderRadius: '100%',
  cursor: 'grab',
  transition: 'background var(--transition-speed)',

  '&:hover': {
    background: 'var(--color-cta-primary-highlight)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },
});
