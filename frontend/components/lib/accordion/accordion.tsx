import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AccordionContentProps, AccordionTriggerProps } from '@radix-ui/react-accordion';
import { forwardRef } from 'react';

import { Stack } from '../stack';
import * as S from './styles';

export const Root = S.Accordion;
export const Item = S.Item;

export const Trigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(({ children, ...props }, ref) => (
  <S.Header>
    <S.Trigger {...props} ref={ref}>
      {children}
      <FontAwesomeIcon icon={faCaretDown}></FontAwesomeIcon>
    </S.Trigger>
  </S.Header>
));
Trigger.displayName = 'AccordionTrigger';

export const Content = forwardRef<HTMLDivElement, AccordionContentProps>(({ children, ...props }, ref) => (
  <S.Content {...props} ref={ref}>
    <S.ContentContainer>
      <Stack>{children}</Stack>
    </S.ContentContainer>
  </S.Content>
));
Content.displayName = 'AccordionContent';
