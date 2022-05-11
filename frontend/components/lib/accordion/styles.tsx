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
  borderRadius: '$standard',
  backgroundColor: '$surface2',
  boxShadow: '$soft',
});

export const Item = styled(AccordionPrimitive.Item, {
  overflow: 'hidden',

  '&:first-child': {
    borderTopLeftRadius: '$standard',
    borderTopRightRadius: '$standard',
  },

  '&:last-child': {
    borderBottomLeftRadius: '$standard',
    borderBottomRightRadius: '$standard',
  },

  '&:focus-within': {
    position: 'relative',
    zIndex: 1,
    boxShadow: '$focus',
  },
});

export const Header = styled(AccordionPrimitive.Header, {
  display: 'flex',
});

export const Trigger = styled(AccordionPrimitive.Trigger, {
  alignItems: 'center',
  boxShadow: '0 1px 0 $colors$border2',
  color: '$brandPrimary',
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
    backgroundColor: '$surface1',

    '& svg': {
      color: '$text1',
      transform: 'rotate(-180deg)',
    },
  },

  '&:hover': { backgroundColor: '$surface1' },

  '& svg': {
    color: '$surface3',
    transition: 'transform 300ms',
  },
});

export const Content = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',
  backgroundColor: '$surface1',

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
