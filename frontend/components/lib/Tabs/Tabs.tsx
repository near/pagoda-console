import { useRouter } from 'next/router';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';
import { useEffect, useRef } from 'react';

import { mergeRefs } from '@/utils/merge-refs';
import type { StableId } from '@/utils/stable-ids';

import * as S from './styles';

type RootProps = ComponentProps<typeof S.Root>;

type TriggerProps = ComponentProps<typeof S.Trigger> & {
  href?: string;
  stableId: StableId;
};

export const List = S.List;
export const Content = S.Content;

export const Root = forwardRef<HTMLDivElement, RootProps>(({ value, ...props }, ref) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = elementRef.current?.querySelector('[data-state="active"]') as HTMLButtonElement;
    const list = elementRef.current?.querySelector('[role="tablist"]') as HTMLDivElement;
    if (target && list) {
      list.scrollLeft = target.offsetLeft - 25;
    }
  }, [value]);

  return <S.Root value={value} ref={mergeRefs([ref, elementRef])} {...props} />;
});
Root.displayName = 'Root';

export const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(({ href, stableId, ...props }, ref) => {
  const elementRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (href) {
      router.prefetch(href);
    }
  }, [href, router]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (href) {
        if (event.metaKey || event.ctrlKey) {
          window.open(href, '_blank');
        } else {
          router.push(href);
        }
      }
    }

    const el = elementRef.current;
    el?.addEventListener('click', onClick);

    return () => {
      el?.removeEventListener('click', onClick);
    };
  }, [href, router]);

  return <S.Trigger ref={mergeRefs([ref, elementRef])} data-stable-id={stableId} {...props} />;
});
Trigger.displayName = 'Trigger';
