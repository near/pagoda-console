import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

import type { StitchesCSS } from '@/styles/stitches';
import { keyframes, styled } from '@/styles/stitches';

const openAnimation = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.9, 0.9)' },
  '100%': { opacity: 1, transform: 'scale(1, 1)' },
});

const closeAnimation = keyframes({
  '0%': { opacity: 1, transform: 'scale(1, 1)' },
  '100%': { opacity: 0, transform: 'scale(0.9, 0.9)' },
});

export const Content = styled(DropdownMenuPrimitive.Content, {
  '--animation-speed': '200ms',
  '--background-color': 'var(--color-surface-overlay)',
  minWidth: 'var(--size-max-container-width-xxs)',
  maxWidth: 'var(--size-max-container-width-xs)',
  backgroundColor: 'var(--background-color)',
  borderRadius: 'var(--border-radius-s)',
  padding: 'var(--space-s)',
  boxShadow: 'var(--shadow-softer)',
  transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',

  '&[data-state="open"]': {
    animation: `${openAnimation} var(--animation-speed)`,
  },
  '&[data-state="closed"]': {
    animation: `${closeAnimation} var(--animation-speed)`,
  },
});

export const ItemSelectedIndicator = styled('div', {
  color: 'var(--color-cta-primary)',
});

export const ItemUnselectedIndicator = styled('div', {
  color: 'var(--color-surface-5)',
});

const itemStyles: StitchesCSS = {
  font: 'var(--font-body)',
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'var(--color-text-1)',
  borderRadius: 'var(--border-radius-s)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-m)',
  padding: 'var(--space-s) var(--space-m)',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  transition: 'var(--transitions)',

  '&[data-disabled]': {
    opacity: '0.3',
    pointerEvents: 'none',
  },

  '&:focus': {
    backgroundColor: 'var(--color-surface-3)',
  },

  '&[data-state="open"]': {
    backgroundColor: 'var(--color-surface-3)',
  },

  '&[data-state="checked"]': {
    [`${ItemSelectedIndicator}`]: {
      display: 'block',
    },
    [`${ItemUnselectedIndicator}`]: {
      display: 'none',
    },
  },

  '&[data-state="unchecked"]': {
    [`${ItemSelectedIndicator}`]: {
      display: 'none',
    },
    [`${ItemUnselectedIndicator}`]: {
      display: 'block',
    },
  },
};

export const Item = styled(DropdownMenuPrimitive.Item, { ...itemStyles, gap: 'var(--space-s)' });

export const TriggerItem = styled(DropdownMenuPrimitive.TriggerItem, {
  ...itemStyles,

  '& > svg': {
    color: 'var(--color-surface-5)',
  },
});

export const CheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem, { ...itemStyles });

export const RadioItem = styled(DropdownMenuPrimitive.RadioItem, { ...itemStyles });

export const Label = styled(DropdownMenuPrimitive.Label, {
  ...itemStyles,
  fontSize: 'var(--font-size-body-small)',
  color: 'var(--color-text-2)',
  cursor: 'default',
});

export const Separator = styled(DropdownMenuPrimitive.Separator, {
  height: 1,
  backgroundColor: 'var(--color-surface-3)',
  margin: 'var(--space-s) 0',
});

export const Arrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: 'var(--background-color)',
});
