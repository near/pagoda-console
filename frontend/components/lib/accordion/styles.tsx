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

export const Accordion = styled(AccordionPrimitive.Root, {
  '--animation-speed': '200ms',
  '--border-radius': 'var(--border-radius-m)',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxShadow: 'var(--shadow-soft)',
  borderRadius: 'var(--border-radius)',
});

export const Header = styled(AccordionPrimitive.Header, {
  display: 'flex',
});

export const Trigger = styled(AccordionPrimitive.Trigger, {
  alignItems: 'center',
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  display: 'flex',
  flex: '1',
  fontWeight: '500',
  justifyContent: 'space-between',
  padding: 'var(--space-m)',
  transition: 'background var(--animation-speed), border-radius var(--animation-speed)',

  '&[data-state="open"]': {
    '& > svg': {
      transform: 'rotate(-180deg)',
    },
  },

  '&:hover': { backgroundColor: 'var(--color-surface-3)' },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: '-1px',
  },

  '& > svg': {
    color: 'var(--color-cta-primary)',
    transition: 'transform var(--animation-speed)',
  },
});

export const Item = styled(AccordionPrimitive.Item, {
  border: '1px solid var(--color-surface-2)',
  borderTopColor: 'var(--color-surface-1)',
  borderBottom: 'none',
  backgroundColor: 'var(--color-surface-2)',
  overflow: 'hidden',

  '&:first-child': {
    borderTop: 'none',
    borderTopLeftRadius: 'var(--border-radius)',
    borderTopRightRadius: 'var(--border-radius)',

    [`& ${Trigger}`]: {
      borderTopLeftRadius: 'var(--border-radius)',
      borderTopRightRadius: 'var(--border-radius)',
    },
  },

  '&:last-child': {
    borderBottom: '1px solid var(--color-surface-2)',
    borderBottomLeftRadius: 'var(--border-radius)',
    borderBottomRightRadius: 'var(--border-radius)',

    [`& ${Trigger}[data-state="closed"]`]: {
      borderBottomLeftRadius: 'var(--border-radius)',
      borderBottomRightRadius: 'var(--border-radius)',
    },
  },

  '&:focus-within': {
    position: 'relative',
    zIndex: 5,
  },
});

export const Content = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',
  background: 'var(--color-surface-1)',

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
