import { keyframes, styled } from '@/styles/stitches';

import { dropdownItemStyles } from '../DropdownMenu/styles';

const openAnimation = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.9, 0.9)' },
  '100%': { opacity: 1, transform: 'scale(1, 1)' },
});

export const Menu = styled('ul', {
  '--animation-speed': '200ms',
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  maxHeight: 'var(--size-max-dropdown-height)',
  overflowY: 'auto',
  border: '1px solid var(--color-surface-overlay)',
  backgroundColor: 'var(--color-surface-overlay)',
  borderRadius: '0 0 var(--border-radius-s) var(--border-radius-s)',
  boxShadow: 'var(--shadow-softer)',
  transformOrigin: 'center top',
  display: 'none',
  opacity: 0,
  zIndex: 500,
  // scrollBehavior: 'smooth', // This property breaks downshift's auto scroll focus logic
});

export const MenuItem = styled('li', {
  ...dropdownItemStyles,
  borderRadius: 0,
});

export const MenuLabel = styled('li', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  padding: 'var(--space-s) var(--space-m)',
  fontSize: 'var(--font-size-body-small)',
  color: 'var(--color-text-3)',
});

export const MenuContent = styled('li', {
  padding: 'var(--space-s) var(--space-m)',
  fontSize: 'var(--font-size-body-small)',
  color: 'var(--color-text-2)',
});

export const Root = styled('div', {
  flexGrow: 1,
  position: 'relative',

  variants: {
    open: {
      true: {
        [`${Menu}`]: {
          display: 'block',
          animation: `${openAnimation} var(--animation-speed) forwards`,
        },

        input: {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },

        button: {
          svg: {
            transform: 'rotate(-180deg)',
          },
        },
      },
    },
  },
});

export const Box = styled('div', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',

  input: {
    paddingRight: 'calc(var(--size-input-height-m) + var(--space-m))',
  },

  button: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: 'none',
    position: 'absolute',
    top: '1px',
    right: '1px',
    bottom: '1px',
    height: 'auto',
    width: 'var(--size-input-height-m)',
    padding: 0,

    svg: {
      transition: 'transform var(--transition-speed)',
    },
  },
});
