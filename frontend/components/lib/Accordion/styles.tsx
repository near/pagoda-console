import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { keyframes, styled } from '@/styles/stitches';

const openAnimation = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const closeAnimation = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
});

export const Header = styled(AccordionPrimitive.Header, {
  display: 'flex',
});

export const Item = styled(AccordionPrimitive.Item, {
  border: '1px solid var(--color-surface-3)',
  borderRadius: 'var(--border-radius)',
  backgroundColor: 'var(--color-surface-1)',

  '&:focus-within': {
    position: 'relative',
    zIndex: 5,
  },
});

export const Trigger = styled(AccordionPrimitive.Trigger, {
  '--icon-color': 'var(--color-text-3)',
  alignItems: 'center',
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  display: 'flex',
  flex: '1',
  fontWeight: 600,
  justifyContent: 'space-between',
  padding: 'var(--space-m)',
  borderRadius: 'var(--border-radius)',
  background: 'var(--color-surface-2)',
  transition: 'color var(--transition-speed), background var(--animation-speed), border-radius var(--animation-speed)',

  '&[data-state="open"]': {
    boxShadow: 'inset 0 -1px 0 var(--color-surface-3)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,

    '& > svg': {
      transform: 'rotate(-180deg)',
    },
  },

  '&:hover': {
    backgroundColor: 'var(--color-surface-1)',
    '--icon-color': 'var(--color-primary)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: '0px',
  },

  '&:disabled': {
    color: 'var(--color-text-3)',
    pointerEvents: 'none',
    '& > svg': {
      display: 'none',
    },
  },

  '& > svg': {
    color: 'var(--icon-color)',
    transition: 'transform var(--animation-speed), color var(--transition-speed)',
  },
});

export const Content = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',
  padding: '1rem',
  margin: '-1rem',

  '&[data-state="open"]': {
    animation: `${openAnimation} var(--animation-speed) ease`,
  },
  '&[data-state="closed"]': {
    animation: `${closeAnimation} var(--animation-speed) ease`,
  },
});

export const ContentContainer = styled('div', {
  padding: 'var(--space-m)',
});

export const Root = styled(AccordionPrimitive.Root, {
  '--animation-speed': '300ms',
  '--border-radius': 'var(--border-radius-m)',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: 'var(--space-m)',

  variants: {
    inline: {
      true: {
        '--border-radius': 0,
        gap: 0,
        borderTop: '1px solid var(--color-border-1)',

        [`${Item}`]: {
          padding: 'var(--space-m) 0',
          background: 'none',
          borderBottom: '1px solid var(--color-border-1)',
        },

        [`${Trigger}`]: {
          background: 'none',
          padding: 'calc(var(--space-m) / 2) 0',
          margin: 'calc(var(--space-m) / 2) 0',
          '&:hover': { color: 'var(--color-primary)' },
          '&:focus': {
            outlineOffset: 'var(--focus-outline-offset)',
          },
        },

        [`${ContentContainer}`]: {
          padding: 'var(--space-m) 0',
        },
      },
    },

    noArrow: {
      true: {
        [`${Trigger} > svg`]: {
          display: 'none',
        },
      },
    },
  },
});
