import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import type { StableId } from '@/utils/stable-ids';

import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import * as S from './styles';

type ContentProps = ComponentProps<typeof S.Content>;
type TriggerProps = ComponentProps<typeof S.Trigger> & {
  stableId: StableId;
};

export const Root = S.Root;
export const Item = S.Item;

export const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(({ children, stableId, ...props }, ref) => {
  return (
    <S.Header>
      <S.Trigger ref={ref} data-stable-id={stableId} {...props}>
        <Flex gap="m" align="center">
          {children}
        </Flex>
        <FeatherIcon icon="chevron-down"></FeatherIcon>
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
