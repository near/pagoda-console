import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { ButtonDropdown } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import * as S from './styles';

type ButtonProps = ComponentProps<typeof ButtonDropdown>;
type ContentProps = ComponentProps<typeof S.Content> & {
  nested?: boolean;
};
type CheckboxItemProps = ComponentProps<typeof S.CheckboxItem>;
type RadioItemProps = ComponentProps<typeof S.RadioItem>;
type TriggerItemProps = ComponentProps<typeof S.TriggerItem>;

export const Item = S.Item;
export const ItemSelectedIndicator = S.ItemSelectedIndicator;
export const ItemUnselectedIndicator = S.ItemUnselectedIndicator;
export const Label = S.Label;
export const RadioGroup = DropdownMenuPrimitive.RadioGroup;
export const Root = DropdownMenuPrimitive.Root;
export const Separator = S.Separator;
export const Trigger = DropdownMenuPrimitive.Trigger;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, color = 'neutral', ...props }, ref) => {
  return (
    <Trigger asChild>
      <ButtonDropdown color={color} ref={ref} {...props}>
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

  return (
    <S.Content ref={ref} alignOffset={alignOffset} sideOffset={sideOffset} {...props}>
      {children}
      <S.Arrow offset={arrowOffset} />
    </S.Content>
  );
});
Content.displayName = 'Content';

export const CheckboxItem = forwardRef<HTMLDivElement, CheckboxItemProps>(({ children, ...props }, ref) => {
  return (
    <S.CheckboxItem ref={ref} {...props}>
      <S.ItemSelectedIndicator>
        <FeatherIcon icon="check-square" />
      </S.ItemSelectedIndicator>
      <S.ItemUnselectedIndicator>
        <FeatherIcon icon="square" />
      </S.ItemUnselectedIndicator>
      {children}
    </S.CheckboxItem>
  );
});
CheckboxItem.displayName = 'CheckboxItem';

export const RadioItem = forwardRef<HTMLDivElement, RadioItemProps>(({ children, ...props }, ref) => {
  return (
    <S.RadioItem ref={ref} {...props}>
      <S.ItemSelectedIndicator>
        <FeatherIcon icon="check-circle" />
      </S.ItemSelectedIndicator>
      <S.ItemUnselectedIndicator>
        <FeatherIcon icon="circle" />
      </S.ItemUnselectedIndicator>
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
