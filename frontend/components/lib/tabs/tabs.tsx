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
  scrollBehavior: 'smooth',

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
  fontSize: 'var(--font-size-h6)',
  lineHeight: 'var(--line-height-h6)',
  fontWeight: 500,
  justifyContent: 'center',
  padding: 'var(--space-m)',
  transition: 'color var(--transition-speed), background var(--transition-speed), box-shadow var(--transition-speed)',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
  borderBottom: 'none',

  '> *': {
    transition: 'color var(--transition-speed)',
  },

  '&:hover': {
    color: 'var(--color-text-1)',
    background: 'var(--color-surface-3)',
  },

  '&:focus': {
    borderColor: 'var(--focus-outline-color)',
  },

  '&[data-state="active"]': {
    color: 'var(--color-text-1)',
    boxShadow: 'inset 0 -2px 0 var(--color-cta-primary)',
    position: 'relative',
    zIndex: 5,
  },
});

export const Content = styled(TabsPrimitive.Content, {
  paddingTop: 'var(--space-l)',
});
