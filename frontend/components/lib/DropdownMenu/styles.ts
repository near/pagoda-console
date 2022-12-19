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

const contentStyles: StitchesCSS = {
  '--animation-speed': '200ms',
  '--background-color': 'var(--color-surface-overlay)',
  backgroundColor: 'var(--background-color)',
  borderRadius: 'var(--border-radius-s)',
  boxShadow: 'var(--shadow-softer)',
  transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',

  '&[data-state="open"]': {
    animation: `${openAnimation} var(--animation-speed)`,
  },
  '&[data-state="closed"]': {
    animation: `${closeAnimation} var(--animation-speed)`,
  },
};

export const Content = styled(DropdownMenuPrimitive.Content, {
  ...contentStyles,

  variants: {
    width: {
      auto: {
        maxWidth: 'min(85vw, var(--size-max-container-width-s))',
      },

      maxTrigger: {
        maxWidth: 'var(--trigger-width, var(--size-max-container-width-s))',
      },

      trigger: {
        maxWidth: 'unset',
        width: 'var(--trigger-width, var(--size-max-container-width-s))',
      },
    },
  },

  defaultVariants: {
    width: 'auto',
  },
});

export const ContentInner = styled('div', {
  padding: 'var(--space-s) var(--space-s) 0',
  maxHeight: 'min(60vh, var(--size-max-dropdown-height))',
  overflow: 'auto',
  scrollBehavior: 'smooth',

  '> *:last-child': { marginBottom: 'var(--space-s)' },
});

export const ContentStickyFooter = styled('div', {
  position: 'sticky',
  bottom: '0',
  background: 'var(--background-color)',
  padding: 'var(--space-s)',
  margin: 'var(--space-s) calc(var(--space-s) * -1) 0',
  marginBottom: '0 !important',
  width: 'auto',
  borderTop: 'solid 1px var(--color-border-2)',
  borderRadius: '0 0 var(--border-radius-s) var(--border-radius-s)',

  '&:first-child': {
    borderTop: 'none',
    marginTop: 'none',
  },
});

export const ItemSelectedIndicator = styled('div', {
  color: 'var(--color-cta-primary)',
  alignItems: 'center',
});

export const ItemUnselectedIndicator = styled('div', {
  color: 'var(--color-text-3)',
  alignItems: 'center',
});

export const dropdownItemStyles: StitchesCSS = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
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

  '&:focus, &:hover, &[data-state="open"], &[aria-selected="true"]': {
    backgroundColor: 'var(--color-surface-2)',
  },

  '&[data-state="checked"]': {
    [`${ItemSelectedIndicator}`]: {
      display: 'flex',
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
      display: 'flex',
    },
  },
};

export const Item = styled(DropdownMenuPrimitive.Item, {
  ...dropdownItemStyles,
  gap: 'var(--space-s)',

  variants: {
    color: {
      primary: {
        color: 'var(--color-primary)',
      },
      text1: {
        color: 'var(--color-text-1)',
      },
    },
  },

  defaultVariants: {
    color: 'text1',
  },
});

export const SubContent = styled(DropdownMenuPrimitive.SubContent, {
  ...contentStyles,
});

export const SubTrigger = styled(DropdownMenuPrimitive.SubTrigger, {
  ...dropdownItemStyles,

  '& > svg': {
    color: 'var(--color-surface-5)',
  },
});

export const CheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem, { ...dropdownItemStyles });

export const RadioItem = styled(DropdownMenuPrimitive.RadioItem, { ...dropdownItemStyles });

export const ContentItem = styled('div', {
  padding: 'var(--space-s) var(--space-m)',
  position: 'relative',
});

export const Label = styled(DropdownMenuPrimitive.Label, {
  ...dropdownItemStyles,
  fontSize: 'var(--font-size-body-small)',
  color: 'var(--color-text-3)',
  cursor: 'default',
  pointerEvents: 'none',
});

export const Separator = styled(DropdownMenuPrimitive.Separator, {
  height: 1,
  backgroundColor: 'var(--color-surface-3)',
  margin: 'var(--space-s) 0',
});

export const Arrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: 'var(--background-color)',
});
