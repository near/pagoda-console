import * as TabsPrimitive from '@radix-ui/react-tabs';

import { styled } from '@/styles/stitches';

export const Root = styled(TabsPrimitive.Root, {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const List = styled(TabsPrimitive.List, {
  flexShrink: 0,
  display: 'flex',
  width: '100%',
  boxShadow: 'inset 0 -2px 0 var(--color-surface-3)',
  overflow: 'auto',
  '-ms-overflow-style': 'none',
  scrollbarWidth: 'none',

  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

export const Trigger = styled(TabsPrimitive.Trigger, {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  color: 'var(--color-text-2)',
  cursor: 'pointer',
  fontSize: 'var(--font-size-h5)',
  fontWeight: 500,
  justifyContent: 'center',
  lineHeight: 'var(--line-height-body)',
  padding: 'var(--space-m)',
  transition: 'color var(--transition-speed), background var(--transition-speed), box-shadow var(--transition-speed)',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
  borderBottom: 'none',

  '@tablet': {
    padding: 'var(--space-s) var(--space-m)',
  },

  '> *': {
    transition: 'color var(--transition-speed)',
  },

  '&[data-state="active"]': {
    background: 'var(--color-surface-2)',
    color: 'var(--color-text-1)',
    boxShadow: 'inset 0 -2px 0 var(--color-cta-primary)',
    position: 'relative',
    zIndex: 5,
  },

  '&:hover': {
    color: 'var(--color-text-1)',
    background: 'var(--color-surface-3)',
  },

  '&:focus': {
    borderColor: 'var(--focus-outline-color)',
  },
});

export const Content = styled(TabsPrimitive.Content, {
  paddingTop: 'var(--space-l)',
});
