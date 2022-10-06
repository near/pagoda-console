import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import type { StableId } from '@/utils/stable-ids';

import * as S from './styles';

type TriggerProps = ComponentProps<typeof S.Trigger> & {
  stableId: StableId;
};

type TriggerLinkProps = ComponentProps<typeof S.TriggerLink> & {
  stableId: StableId;
};

export const Root = S.Root;
export const List = S.List;
export const Content = S.Content;

export const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(({ stableId, ...props }, ref) => {
  return <S.Trigger ref={ref} data-stable-id={stableId} {...props} />;
});
Trigger.displayName = 'Trigger';

export const TriggerLink = forwardRef<HTMLAnchorElement, TriggerLinkProps>(({ stableId, ...props }, ref) => {
  return <S.TriggerLink ref={ref} data-stable-id={stableId} {...props} />;
});
TriggerLink.displayName = 'TriggerLink';
