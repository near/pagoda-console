import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { keyframes, styled } from '@/styles/theme';

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
});

export const Accordion = styled(AccordionPrimitive.Root, {
  '--animationSpeed': '200ms',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '$s',
});

export const Item = styled(AccordionPrimitive.Item, {
  overflow: 'hidden',
  borderRadius: '$standard',
  boxShadow: '$soft',
  backgroundColor: '$gray50',

  '&:focus-within': {
    position: 'relative',
    zIndex: 1,
    outline: '1px solid',
    outlineOffset: '2px',
    outlineColor: '$gray500',
  },
});

export const Header = styled(AccordionPrimitive.Header, {
  display: 'flex',
});

export const Trigger = styled(AccordionPrimitive.Trigger, {
  alignItems: 'center',
  boxShadow: '0 1px 0 $colors$gray25',
  color: '$gray900',
  cursor: 'pointer',
  display: 'flex',
  flex: '1',
  fontFamily: '$body',
  fontWeight: '500',
  fontSize: '$body',
  justifyContent: 'space-between',
  lineHeight: '$standard',
  padding: '$m',
  transition: 'background var(--animationSpeed)',

  '&[data-state="open"]': {
    '& svg': {
      transform: 'rotate(-180deg)',
    },
  },

  '&:hover': { backgroundColor: '$gray100' },

  '& svg': {
    color: '$green500',
    transition: 'transform 300ms',
  },
});

export const Content = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',
  backgroundColor: '$gray50',

  '&[data-state="open"]': {
    animation: `${slideDown} var(--animationSpeed) ease forwards`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} var(--animationSpeed) ease forwards`,
  },
});

export const ContentContainer = styled('div', {
  padding: '$m',
});
