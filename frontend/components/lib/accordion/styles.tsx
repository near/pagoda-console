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
  gap: 'var(--space-s)',
});

export const Item = styled(AccordionPrimitive.Item, {
  overflow: 'hidden',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-soft)',
  backgroundColor: 'var(--color-surface-2)',

  '&:focus-within': {
    position: 'relative',
    zIndex: 1,
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },
});

export const Header = styled(AccordionPrimitive.Header, {
  display: 'flex',
});

export const Trigger = styled(AccordionPrimitive.Trigger, {
  alignItems: 'center',
  boxShadow: '0 1px 0 var(--color-surface-1)',
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  display: 'flex',
  flex: '1',
  fontWeight: '500',
  justifyContent: 'space-between',
  padding: 'var(--space-m)',
  transition: 'background var(--animation-speed)',

  '&[data-state="open"]': {
    '& svg': {
      transform: 'rotate(-180deg)',
    },
  },

  '&:hover': { backgroundColor: 'var(--color-surface-3)' },

  '& svg': {
    color: 'var(--color-cta-primary)',
    transition: 'transform var(--animation-speed)',
  },
});

export const Content = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',

  '&[data-state="open"]': {
    animation: `${slideDown} var(--animation-speed) ease forwards`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} var(--animation-speed) ease forwards`,
  },
});

export const ContentContainer = styled('div', {
  padding: 'var(--space-m)',
});
