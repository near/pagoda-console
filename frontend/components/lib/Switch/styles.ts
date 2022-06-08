import * as SwitchPrimitive from '@radix-ui/react-switch';

import { styled } from '@/styles/stitches';

export const Switch = styled(SwitchPrimitive.Root, {
  '--height': 'var(--size-input-height-s)',
  '--width': 'calc((var(--height) * 2) - 4px)',
  width: 'var(--width)',
  height: 'var(--height)',
  flexShrink: 0,
  background: 'var(--color-surface-5)',
  borderRadius: '100px',
  position: 'relative',
  transition: 'var(--transitions)',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  '&[data-state="checked"]': {
    backgroundColor: 'var(--color-primary)',
  },
});

export const SwitchThumb = styled(SwitchPrimitive.Thumb, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  width: 'calc(var(--height) - 4px)',
  height: 'calc(var(--height) - 4px)',
  position: 'absolute',
  top: '2px',
  left: '2px',
  backgroundColor: '#fff',
  color: '#888e98',
  borderRadius: '100%',
  boxShadow: `var(--shadow-soft)`,
  transition: 'transform var(--transition-speed)',
  transform: 'translateX(0%)',
  willChange: 'transform',

  '& > *': {
    transition: 'color var(--transition-speed)',
  },

  '&[data-state="checked"]': {
    transform: 'translateX(100%)',
    color: 'var(--color-primary)',

    '[data-off]': {
      display: 'none',
    },
  },

  '&[data-state="unchecked"]': {
    '[data-on]': {
      display: 'none',
    },
  },
});
