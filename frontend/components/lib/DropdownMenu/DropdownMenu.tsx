import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { forwardRef } from 'react';

import { ButtonDropdown } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import * as S from './styles';

type ButtonProps = ComponentProps<typeof ButtonDropdown>;
type ContentProps = ComponentProps<typeof S.Content> & {
  nested?: boolean;
};
type CheckboxItemProps = ComponentProps<typeof S.CheckboxItem> & {
  indicator?: ReactNode | null;
};
type RadioItemProps = ComponentProps<typeof S.RadioItem> & {
  indicator?: ReactNode | null;
};
type TriggerItemProps = ComponentProps<typeof S.TriggerItem>;

export const Item = S.Item;
export const Label = S.Label;
export const RadioGroup = DropdownMenuPrimitive.RadioGroup;
export const Root = DropdownMenuPrimitive.Root;
export const Separator = S.Separator;
export const Trigger = DropdownMenuPrimitive.Trigger;
export const ContentItem = S.ContentItem;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  return (
    <Trigger asChild>
      <ButtonDropdown ref={ref} {...props}>
        {children}
      </ButtonDropdown>
    </Trigger>
  );
});
Button.displayName = 'Button';

export const Content = forwardRef<HTMLDivElement, ContentProps>(({ children, nested, ...props }, ref) => {
  const alignOffset = nested ? -6 : props.alignOffset;
  const sideOffset = nested ? 14 : props.sideOffset || 6;
  const arrowOffset = nested ? 24 : 16;
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function calculateWidth(container?: HTMLDivElement) {
    containerRef.current = container || containerRef.current;
    if (!containerRef.current) return;

    const triggerId = containerRef.current.getAttribute('aria-labelledby');
    if (!triggerId) return;
    const trigger = document.getElementById(triggerId);

    if (trigger?.offsetWidth) {
      containerRef.current.style.setProperty('--trigger-width', `${trigger.offsetWidth}px`);
    }
  }

  function onWindowResize() {
    calculateWidth();
  }

  return (
    <S.Content
      onAnimationStart={(e) => calculateWidth(e.currentTarget)}
      ref={ref}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      {...props}
    >
      <S.ContentInner>{children}</S.ContentInner>
      <S.Arrow offset={arrowOffset} />
    </S.Content>
  );
});
Content.displayName = 'Content';

export const CheckboxItem = forwardRef<HTMLDivElement, CheckboxItemProps>(({ children, indicator, ...props }, ref) => {
  return (
    <S.CheckboxItem ref={ref} {...props}>
      {indicator !== null && (
        <>
          <S.ItemSelectedIndicator>
            {indicator ? indicator : <FeatherIcon icon="check-square" />}
          </S.ItemSelectedIndicator>
          <S.ItemUnselectedIndicator>{indicator ? indicator : <FeatherIcon icon="square" />}</S.ItemUnselectedIndicator>
        </>
      )}

      {children}
    </S.CheckboxItem>
  );
});
CheckboxItem.displayName = 'CheckboxItem';

export const RadioItem = forwardRef<HTMLDivElement, RadioItemProps>(({ children, indicator, ...props }, ref) => {
  return (
    <S.RadioItem ref={ref} {...props}>
      {indicator !== null && (
        <>
          <S.ItemSelectedIndicator>
            {indicator ? indicator : <FeatherIcon icon="check-circle" />}
          </S.ItemSelectedIndicator>
          <S.ItemUnselectedIndicator>{indicator ? indicator : <FeatherIcon icon="circle" />}</S.ItemUnselectedIndicator>
        </>
      )}

      {children}
    </S.RadioItem>
  );
});
RadioItem.displayName = 'RadioItem';

export const TriggerItem = forwardRef<HTMLDivElement, TriggerItemProps>(({ children, ...props }, ref) => {
  return (
    <S.TriggerItem ref={ref} {...props}>
      <Flex gap="s">{children}</Flex>

      <FeatherIcon icon="chevron-right" />
    </S.TriggerItem>
  );
});
TriggerItem.displayName = 'TriggerItem';
