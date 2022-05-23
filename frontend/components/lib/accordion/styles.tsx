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
  '--border-radius': 'var(--border-radius-s)',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: 'var(--space-m)',
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
  alignItems: 'center',
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  display: 'flex',
  flex: '1',
  fontWeight: '500',
  justifyContent: 'space-between',
  padding: 'var(--space-m)',
  borderRadius: 'var(--border-radius)',
  background: 'var(--color-surface-2)',
  transition: 'background var(--animation-speed), border-radius var(--animation-speed)',

  '&[data-state="open"]': {
    boxShadow: 'inset 0 -1px 0 var(--color-surface-3)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,

    '& > svg': {
      transform: 'rotate(-180deg)',
    },
  },

  '&:hover': { backgroundColor: 'var(--color-surface-3)' },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: '0px',
  },

  '& > svg': {
    color: 'var(--color-cta-primary)',
    transition: 'transform var(--animation-speed)',
  },
});

export const Content = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',

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
