// https://www.radix-ui.com/docs/primitives/components/accordion

import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ComponentProps, ElementRef } from 'react';
import { forwardRef } from 'react';

import { Stack } from '../stack';
import * as S from './styles';

export const Root = S.Accordion;
export const Item = S.Item;

export const Trigger = forwardRef<ElementRef<typeof S.Trigger>, ComponentProps<typeof S.Trigger>>(
  ({ children, ...props }, ref) => (
    <S.Header>
      <S.Trigger {...props} ref={ref}>
        {children}
        <FontAwesomeIcon icon={faCaretDown}></FontAwesomeIcon>
      </S.Trigger>
    </S.Header>
  ),
);
Trigger.displayName = 'AccordionTrigger';

export const Content = forwardRef<ElementRef<typeof S.Content>, ComponentProps<typeof S.Content>>(
  ({ children, ...props }, ref) => (
    <S.Content {...props} ref={ref}>
      <S.ContentContainer>
        <Stack>{children}</Stack>
      </S.ContentContainer>
    </S.Content>
  ),
);
Content.displayName = 'AccordionContent';
