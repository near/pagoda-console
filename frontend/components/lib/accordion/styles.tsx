import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { keyframes, styled } from '@/styles/stitches';

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
});

export const Accordion = styled(AccordionPrimitive.Root, {
  '--animation-speed': '200ms',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxShadow: 'var(--shadow-soft)',
});

export const Item = styled(AccordionPrimitive.Item, {
  border: '1px solid var(--color-surface-3)',
  borderTop: 'none',
  backgroundColor: 'var(--color-surface-2)',

  '&:first-child': {
    borderTop: '1px solid var(--color-surface-3)',
    borderTopLeftRadius: 'var(--border-radius-s)',
    borderTopRightRadius: 'var(--border-radius-s)',
  },

  '&:last-child': {
    borderBottomLeftRadius: 'var(--border-radius-s)',
    borderBottomRightRadius: 'var(--border-radius-s)',
  },

  '&:focus-within': {
    position: 'relative',
    zIndex: 5,
  },
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
  transition: 'background var(--animation-speed), box-shadow var(--animation-speed)',

  '&[data-state="open"]': {
    backgroundColor: 'var(--color-surface-3)',
    boxShadow: 'var(--shadow-soft)',

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
  background: 'var(--color-surface-1)',

  '&[data-state="open"]': {
    animation: `${slideDown} var(--animation-speed) ease`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} var(--animation-speed) ease`,
  },
});

export const ContentContainer = styled('div', {
  padding: 'var(--space-m)',
});
