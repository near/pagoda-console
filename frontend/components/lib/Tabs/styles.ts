import * as TabsPrimitive from '@radix-ui/react-tabs';

import type { StitchesCSS } from '@/styles/stitches';
import { styled } from '@/styles/stitches';

export const Root = styled(TabsPrimitive.Root, {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const triggerStyles: StitchesCSS = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  fontFamily: 'var(--font-action)',
  fontSize: 'var(--font-size-h6)',
  lineHeight: 'var(--line-height-h6)',
  fontWeight: 500,
  justifyContent: 'center',
  padding: 'var(--trigger-padding)',
  transition: 'var(--transitions)',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
  borderTopRightRadius: 'var(--border-radius)',
  borderTopLeftRadius: 'var(--border-radius)',
  borderBottom: 'none',
  flexShrink: 0,

  '&:hover': {
    boxShadow: 'inset 0 var(--border-size) 0 var(--color-text-1)',
  },

  '&:focus': {
    borderColor: 'var(--focus-outline-color) !important',
  },
};

const triggerActiveStyles: StitchesCSS = {
  color: 'var(--color-cta-primary) !important',
  boxShadow: 'inset 0 var(--border-size) 0 var(--color-cta-primary) !important',
  position: 'relative',
  zIndex: 5,
};

export const Trigger = styled(TabsPrimitive.Trigger, {
  ...triggerStyles,

  '&[data-state="active"]': {
    ...triggerActiveStyles,
  },

  '&:disabled': {
    pointerEvents: 'none',
    color: 'var(--color-text-3)',
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

export const List = styled(TabsPrimitive.List, {
  '--border-radius': 'var(--border-radius-m)',
  '--border-size': '-1px',
  '--trigger-padding': 'var(--space-m)',
  display: 'flex',
  width: '100%',
  boxShadow: 'inset 0 var(--border-size) 0 var(--color-surface-5)',
  overflow: 'auto',
  '-ms-overflow-style': 'none',
  scrollbarWidth: 'none',
  scrollBehavior: 'smooth',

  '&::-webkit-scrollbar': {
    display: 'none',
  },

  variants: {
    inline: {
      true: {
        '--border-radius': '0',
        '--trigger-padding': 'var(--space-xs) 0',
        boxShadow: 'none',
        width: 'auto',
        gap: 'var(--space-l)',

        [`${Trigger}, ${TriggerLink}`]: {
          border: '1px solid transparent',
        },
      },
    },
  },
});

export const Content = styled(TabsPrimitive.Content, {
  paddingTop: 'var(--space-l)',
});
