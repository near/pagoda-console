import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { Flex } from '../flex';
import * as S from './styles';

type ContentProps = ComponentProps<typeof S.Content>;
type TriggerProps = ComponentProps<typeof S.Trigger>;

export const Root = S.Accordion;
export const Item = S.Item;

export const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(({ children, ...props }, ref) => {
  return (
    <S.Header>
      <S.Trigger ref={ref} {...props}>
        <Flex gap="s" align="center">
          {children}
        </Flex>
        <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon>
      </S.Trigger>
    </S.Header>
  );
});
Trigger.displayName = 'Trigger';

export const Content = forwardRef<HTMLDivElement, ContentProps>(({ children, ...props }, ref) => {
  return (
    <S.Content ref={ref} {...props}>
      <S.ContentContainer>{children}</S.ContentContainer>
    </S.Content>
  );
});
Content.displayName = 'Content';
