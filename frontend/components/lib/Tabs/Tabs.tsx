import * as TabsPrimitive from '@radix-ui/react-tabs';

import type { StitchesCSS } from '@/styles/stitches';
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
  boxShadow: 'inset 0 -2px 0 var(--color-surface-5)',
  overflow: 'auto',
  '-ms-overflow-style': 'none',
  scrollbarWidth: 'none',
  scrollBehavior: 'smooth',

  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const triggerStyles: StitchesCSS = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  color: 'var(--color-text-2)',
  cursor: 'pointer',
  fontFamily: 'var(--font-action)',
  fontSize: 'var(--font-size-h6)',
  lineHeight: 'var(--line-height-h6)',
  fontWeight: 500,
  justifyContent: 'center',
  padding: 'var(--space-m)',
  transition: 'var(--transitions)',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
  borderTopRightRadius: 'var(--border-radius-m)',
  borderTopLeftRadius: 'var(--border-radius-m)',
  borderBottom: 'none',

  '&:hover': {
    color: 'var(--color-text-1)',
    boxShadow: 'inset 0 -2px 0 var(--color-text-1)',
  },

  '&:focus': {
    borderColor: 'var(--focus-outline-color)',
  },
};

const triggerActiveStyles: StitchesCSS = {
  color: 'var(--color-cta-primary)',
  boxShadow: 'inset 0 -2px 0 var(--color-cta-primary)',
  position: 'relative',
  zIndex: 5,
};

export const Trigger = styled(TabsPrimitive.Trigger, {
  '&[data-state="active"]': {
    ...triggerActiveStyles,
  },
});

export const TriggerLink = styled('a', {
  ...triggerStyles,

  variants: {
    active: {
      true: {
        ...triggerActiveStyles,
      },
    },
  },
});

export const Content = styled(TabsPrimitive.Content, {
  paddingTop: 'var(--space-l)',
});
